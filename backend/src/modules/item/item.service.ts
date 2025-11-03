import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Item } from '../../database/entities/item.entity';
import { IdSegment, Inventory } from '../../database/entities/inventory.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemFieldValue } from '../../database/entities/item_field_value.entity';
import {
  extractSequenceNumber,
  generateCustomId,
  generateIdTemplate,
  getSegmentAtPosition,
  isValidEditableChar,
} from '../../common/utils/id-generator.util';
import { CustomField } from 'src/database/entities/custom_field.entity';
import { version } from 'os';
import { ItemLike } from 'src/database/entities/item_like.entity';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(ItemFieldValue)
    private readonly itemFieldValueRepository: Repository<ItemFieldValue>,
    @InjectRepository(ItemLike)
    private readonly itemLikeRepository: Repository<ItemLike>,
    private readonly dataSource: DataSource,
  ) {}

  // ========== TINY REUSABLE FUNCTIONS ==========

  private async getInventoryWithFields(
    inventoryId: string,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
      relations: ['customFields'],
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with ID "${inventoryId}" not found.`,
      );
    }

    return inventory;
  }

  private createFieldMap(customFields: any[]): Map<string, any> {
    return new Map(customFields.map((field) => [field.id.toString(), field]));
  }

  private async getNextSequenceNumber(
    queryRunner: any,
    inventoryId: string,
  ): Promise<number> {
    return queryRunner.manager
      .createQueryBuilder(Item, 'item')
      .select('MAX(item.sequenceNumber)', 'maxSequence')
      .where('item.inventoryId = :inventoryId', { inventoryId })
      .getRawOne()
      .then((result) => (result.maxSequence || 0) + 1);
  }

  private createBaseItem(
    inventoryId: string,
    userId: string,
    sequenceNumber: number,
    customId: string,
  ): Item {
    return this.itemRepository.create({
      inventoryId,
      createdBy: userId,
      sequenceNumber,
      customId,
    });
  }

  private createFieldValue(
    itemId: string,
    fieldId: number,
    value: any,
    fieldType: string,
  ): ItemFieldValue {
    const fieldValue = new ItemFieldValue();
    fieldValue.itemId = itemId;
    fieldValue.fieldId = fieldId;

    if (fieldType === 'number') fieldValue.valueNumber = Number(value);
    else if (fieldType === 'boolean')
      fieldValue.valueBoolean = this.toBoolean(value);
    else fieldValue.valueText = String(value);

    return fieldValue;
  }

  private toBoolean(value: any): boolean {
    return value === true || value === 'true' || value === 1;
  }

  private createFieldValues(
    itemId: string,
    fields: any,
    fieldMap: Map<string, any>,
  ): ItemFieldValue[] {
    return Object.entries(fields)
      .map(([fieldIdStr, value]) => {
        const fieldDef = fieldMap.get(fieldIdStr);
        if (!fieldDef) return null;

        return this.createFieldValue(
          itemId,
          parseInt(fieldIdStr, 10),
          value,
          fieldDef.type,
        );
      })
      .filter((field): field is ItemFieldValue => field !== null);
  }

  private async saveFieldValues(
    queryRunner: any,
    fieldValues: ItemFieldValue[],
  ): Promise<void> {
    if (fieldValues.length > 0) {
      await queryRunner.manager.save(ItemFieldValue, fieldValues);
    }
  }

  private getItemWithRelations(itemId: string): Promise<Item> {
    return this.itemRepository.findOneOrFail({
      where: { id: itemId },
      relations: ['fieldValues', 'fieldValues.field'],
    });
  }

  private handleTransactionError(error: any): void {
    if (error.code === '23505') {
      throw new ConflictException(
        'A duplicate Custom ID was generated. Please try again.',
      );
    }
    throw error;
  }
  private formatItemForResponse(item: Item): any {
    const fields = {};

    if (item.fieldValues) {
      item.fieldValues.forEach((fv) => {
        const key = fv.field.title;
        fields[key] = this.getFieldValue(fv);
      });
    }

    return {
      id: item.id,
      inventoryId: item.inventoryId,
      customId: item.customId,
      likes: item.likes,
      version: item.version,
      fields,
    };
  }

  private getFieldValue(fieldValue: ItemFieldValue): any {
    if (fieldValue.field.type === 'number') return fieldValue.valueNumber;
    if (fieldValue.field.type === 'boolean') return fieldValue.valueBoolean;
    return fieldValue.valueText;
  }

  private async getItemForUpdate(
    queryRunner: any,
    itemId: string,
    version: number,
  ): Promise<Item> {
    const item = await queryRunner.manager.findOne(Item, {
      where: { id: itemId },
      relations: ['inventory', 'inventory.customFields'],
    });

    if (!item)
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    if (item.version !== version)
      throw new ConflictException(
        'This item was modified by another user. Please refresh and try again.',
      );

    return item;
  }

  private formatFieldDefinitions(customFields: CustomField[]): any[] {
    return customFields
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((field) => ({
        id: field.id,
        title: field.title,
        type: field.type,
        description: field.description,
        showInTable: field.showInTable,
        orderIndex: field.orderIndex,
      }));
  }

  private async updateFieldValues(
    queryRunner: any,
    itemId: string,
    fields: any,
    fieldMap: Map<string, any>,
  ): Promise<void> {
    // Get existing field values
    const existingValues = await queryRunner.manager.find(ItemFieldValue, {
      where: { itemId },
    });

    const existingValueMap = new Map(
      existingValues.map((value) => [value.fieldId.toString(), value]),
    );

    // Update or create only the provided fields
    for (const [fieldKey, newValue] of Object.entries(fields)) {
      const fieldDef = fieldMap.get(fieldKey);
      if (!fieldDef) continue;

      const fieldId = parseInt(fieldKey, 10);

      if (existingValueMap.has(fieldKey)) {
        // UPDATE existing field value
        const existingValue = existingValueMap.get(fieldKey) as ItemFieldValue; // ADD TYPE CAST
        this.updateSingleFieldValue(existingValue, newValue, fieldDef.type);
        await queryRunner.manager.save(ItemFieldValue, existingValue);
      } else {
        // CREATE new field value
        const newFieldValue = this.createFieldValue(
          itemId,
          fieldId,
          newValue,
          fieldDef.type,
        );
        await queryRunner.manager.save(ItemFieldValue, newFieldValue);
      }
    }
  }

  private updateSingleFieldValue(
    fieldValue: ItemFieldValue,
    newValue: any,
    fieldType: string,
  ): void {
    // Clear all value columns first
    fieldValue.valueText = null as any;
    fieldValue.valueNumber = null as any;
    fieldValue.valueBoolean = null as any;

    // Set the appropriate value column
    if (fieldType === 'number') fieldValue.valueNumber = Number(newValue);
    else if (fieldType === 'boolean')
      fieldValue.valueBoolean = this.toBoolean(newValue);
    else fieldValue.valueText = String(newValue);
  }

  private async getItemById(itemId: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item)
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    return item;
  }

  private async incrementLikesCount(itemId: string): Promise<void> {
    await this.itemRepository.increment({ id: itemId }, 'likes', 1);
  }

  private async decrementLikesCount(itemId: string): Promise<void> {
    await this.itemRepository.decrement({ id: itemId }, 'likes', 1);
  }

  private async getItemLikesCount(itemId: string): Promise<number> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      select: ['likes'],
    });
    return item?.likes || 0;
  }

  // ========== STATISTICS FUNCTIONS ==========

  private async getTotalItemsCount(inventoryId: string): Promise<number> {
    return this.itemRepository.count({ where: { inventoryId } });
  }

  private async getTopContributors(inventoryId: string): Promise<any[]> {
    // Reusing itemRepository for user contribution stats
    const contributors = await this.itemRepository
      .createQueryBuilder('item')
      .select('item.createdBy', 'userId')
      .addSelect('COUNT(item.id)', 'itemCount')
      .addSelect('user.name', 'userName')
      .leftJoin('item.creator', 'user')
      .where('item.inventoryId = :inventoryId', { inventoryId })
      .groupBy('item.createdBy, user.name')
      .orderBy('"itemCount"', 'DESC')
      .limit(5)
      .getRawMany();

    return contributors.map((c) => ({
      userId: c.userId,
      name: c.userName,
      itemCount: parseInt(c.itemCount),
    }));
  }

  private async getMonthlyGrowth(inventoryId: string): Promise<any[]> {
    // Last 6 months of item creation data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await this.itemRepository
      .createQueryBuilder('item')
      .select(`TO_CHAR(item.createdAt, 'YYYY-MM')`, 'month')
      .addSelect('EXTRACT(YEAR FROM item.createdAt)', 'year')
      .addSelect('COUNT(item.id)', 'count')
      .where('item.inventoryId = :inventoryId', { inventoryId })
      .andWhere('item.createdAt >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy(
        `TO_CHAR(item.createdAt, 'YYYY-MM'), EXTRACT(YEAR FROM item.createdAt)`,
      )
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany();

    return monthlyData.map((m) => ({
      month: m.month,
      year: parseInt(m.year),
      count: parseInt(m.count),
    }));
  }

  private async getFieldStats(
    inventoryId: string,
    fieldTitle: string,
    fieldType: string,
  ): Promise<any> {
    const inventory = await this.getInventoryWithFields(inventoryId);
    const fieldMap = this.createFieldMap(inventory.customFields);

    // Find field by title (reusing our field resolution logic)
    const fieldDef = Array.from(fieldMap.values()).find(
      (field) => field.title === fieldTitle,
    );
    if (!fieldDef) return null;

    // Get stats based on field type
    if (fieldType === 'number') {
      return this.getNumericFieldStats(fieldDef.id);
    }

    return null;
  }

  private async getNumericFieldStats(fieldId: number): Promise<any> {
    const stats = await this.itemFieldValueRepository
      .createQueryBuilder('fv')
      .select('AVG(fv.valueNumber)', 'avg')
      .addSelect('MIN(fv.valueNumber)', 'min')
      .addSelect('MAX(fv.valueNumber)', 'max')
      .addSelect('SUM(fv.valueNumber)', 'total')
      .where('fv.fieldId = :fieldId', { fieldId })
      .andWhere('fv.valueNumber IS NOT NULL')
      .getRawOne();

    return {
      avg: parseFloat(stats.avg) || 0,
      min: parseFloat(stats.min) || 0,
      max: parseFloat(stats.max) || 0,
      total: parseFloat(stats.total) || 0,
    };
  }

  // ========== CUSTOM ID EDIT VALIDATION ==========

  private validateCustomIdEdit(
    oldCustomId: string,
    newCustomId: string,
    idFormat: IdSegment[],
  ): { valid: boolean; message: string } {
    if (!newCustomId || newCustomId.length === 0) {
      return { valid: false, message: 'Custom ID cannot be empty' };
    }

    if (oldCustomId === newCustomId) {
      return { valid: true, message: 'No changes detected' };
    }

    // Generate template and validate structure
    const template = generateIdTemplate(idFormat);

    if (template.length !== newCustomId.length) {
      return {
        valid: false,
        message: `Custom ID must be ${template.length} characters`,
      };
    }

    // Validate each character position
    for (let i = 0; i < template.length; i++) {
      const templateChar = template[i];
      const oldChar = oldCustomId[i];
      const newChar = newCustomId[i];

      if (templateChar !== 'x') {
        // Fixed position (including suffixes) - must match original
        if (newChar !== oldChar) {
          return {
            valid: false,
            message: `Character at position ${i + 1} cannot be changed`,
          };
        }
      } else {
        // Editable position - validate character type
        const segmentInfo = getSegmentAtPosition(i, idFormat);
        if (!segmentInfo || !isValidEditableChar(newChar, segmentInfo)) {
          return {
            valid: false,
            message: `Invalid character at position ${i + 1}`,
          };
        }
      }
    }

    return { valid: true, message: 'Valid edit' };
  }

  private basicFormatValidation(
    customId: string,
    idFormat: IdSegment[],
  ): { valid: boolean; message: string } {
    // Temporary basic validation
    // This will be replaced with proper segment parsing
    try {
      // Try generating an ID to see if the format is valid
      const testId = generateCustomId(idFormat, 1);
      // If we can generate an ID, the format is likely valid
      // TODO: Replace with actual segment parsing
      return { valid: true, message: 'Basic format validation passed' };
    } catch (error) {
      return {
        valid: false,
        message: 'Custom ID does not match inventory format',
      };
    }
  }

  private hasSequenceSegmentChanged(
    oldCustomId: string,
    newCustomId: string,
    idFormat: IdSegment[],
  ): boolean {
    const template = generateIdTemplate(idFormat);
    const hasSequence = idFormat.some((segment) => segment.type === 'sequence');

    if (!hasSequence) return false;

    // Check if any sequence character changed
    for (let i = 0; i < template.length; i++) {
      if (template[i] === 'x') {
        const segmentInfo = getSegmentAtPosition(i, idFormat);
        if (
          segmentInfo?.segment.type === 'sequence' &&
          oldCustomId[i] !== newCustomId[i]
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private extractSequenceNumber(
    customId: string,
    idFormat: IdSegment[],
  ): number {
    return extractSequenceNumber(customId, idFormat);
  }

  // ========== MAIN SERVICE METHODS ==========

  async create(
    inventoryId: string,
    createItemDto: CreateItemDto,
    userId: string,
  ): Promise<Item> {
    const inventory = await this.getInventoryWithFields(inventoryId);
    const fieldMap = this.createFieldMap(inventory.customFields);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const nextSequence = await this.getNextSequenceNumber(
        queryRunner,
        inventory.id,
      );
      const customId = generateCustomId(inventory.idFormat, nextSequence);

      const newItem = this.createBaseItem(
        inventory.id,
        userId,
        nextSequence,
        customId,
      );
      const savedItem = await queryRunner.manager.save(Item, newItem);

      const fieldValues = this.createFieldValues(
        savedItem.id,
        createItemDto.fields,
        fieldMap,
      );
      await this.saveFieldValues(queryRunner, fieldValues);

      await queryRunner.commitTransaction();
      return this.getItemWithRelations(savedItem.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505' && error.detail?.includes('custom_id')) {
        throw new ConflictException(
          'Custom ID already exists. Please try again or edit custom ID manually.',
        );
      }
      this.handleTransactionError(error);
      throw error; // ADD THIS LINE to ensure the function always returns or throws
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    inventoryId: string,
    paginationDto: PaginationDto,
  ): Promise<any> {
    const { page, limit, sortBy, order } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await this.itemRepository.findAndCount({
      where: { inventoryId },
      relations: ['fieldValues', 'fieldValues.field'],
      order: { [sortBy]: order },
      skip,
      take: limit,
    });

    return {
      items: items.map((item) => this.formatItemForResponse(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    itemId: string,
    updateItemDto: UpdateItemDto,
    userId: string,
  ): Promise<Item> {
    const { version, fields, customId } = updateItemDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const item = await this.getItemForUpdate(queryRunner, itemId, version);
      console.log('BEFORE UPDATE - Version:', item.version);

      // ========== CUSTOM ID VALIDATION ==========
      if (customId && customId !== item.customId) {
        const validation = this.validateCustomIdEdit(
          item.customId,
          customId,
          item.inventory.idFormat,
        );
        if (!validation.valid) {
          throw new BadRequestException(validation.message);
        }

        if (
          this.hasSequenceSegmentChanged(
            item.customId,
            customId,
            item.inventory.idFormat,
          )
        ) {
          const newSequence = this.extractSequenceNumber(
            customId,
            item.inventory.idFormat,
          );
          item.sequenceNumber = newSequence;
        }

        item.customId = customId;
      }
      // ========== END CUSTOM ID VALIDATION ==========

      const fieldMap = this.createFieldMap(item.inventory.customFields);
      await this.updateFieldValues(queryRunner, itemId, fields, fieldMap);

      // ========== FIX: SAVE THE ITEM ENTITY TO TRIGGER VERSION INCREMENT ==========
      item.version += 1;
      await queryRunner.manager.save(Item, item);
      console.log('AFTER SAVE - Version:', item.version);
      // ========== END FIX ==========

      await queryRunner.commitTransaction();
      const finalItem = await this.getItemWithRelations(itemId);
      console.log('FINAL - Version:', finalItem.version);

      return finalItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505' && error.detail?.includes('custom_id')) {
        throw new ConflictException(
          'Custom ID already exists within this inventory. Please edit manually.',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(itemId: string): Promise<void> {
    const result = await this.itemRepository.delete(itemId);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    }
  }

  async getInventoryFields(inventoryId: string): Promise<any[]> {
    const inventory = await this.getInventoryWithFields(inventoryId);
    return this.formatFieldDefinitions(inventory.customFields);
  }

  async toggleLike(
    itemId: string,
    userId: string,
  ): Promise<{ liked: boolean; likes: number }> {
    const existingLike = await this.itemLikeRepository.findOne({
      where: { itemId, userId },
    });

    if (existingLike) {
      // Unlike - remove the like record
      await this.itemLikeRepository.delete({ itemId, userId });
      await this.decrementLikesCount(itemId);
      return { liked: false, likes: await this.getItemLikesCount(itemId) };
    } else {
      // Like - create new like record
      const newLike = this.itemLikeRepository.create({ itemId, userId });
      await this.itemLikeRepository.save(newLike);
      await this.incrementLikesCount(itemId);
      return { liked: true, likes: await this.getItemLikesCount(itemId) };
    }
  }

  async hasUserLikedItem(itemId: string, userId: string): Promise<boolean> {
    const like = await this.itemLikeRepository.findOne({
      where: { itemId, userId },
    });
    return !!like;
  }

  async getInventoryStats(inventoryId: string): Promise<any> {
    const [totalItems, topContributors, monthlyGrowth] = await Promise.all([
      this.getTotalItemsCount(inventoryId),
      this.getTopContributors(inventoryId),
      this.getMonthlyGrowth(inventoryId),
    ]);

    // Conditionally get field stats
    const [priceStats, quantityStats] = await Promise.all([
      this.getFieldStats(inventoryId, 'Price', 'number'),
      this.getFieldStats(inventoryId, 'Quantity', 'number'),
    ]);

    return {
      totalItems,
      topContributors,
      monthlyGrowth,
      ...(priceStats && { priceStats }),
      ...(quantityStats && { quantityStats }),
    };
  }

  async findOne(itemId: string): Promise<any> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['fieldValues', 'fieldValues.field'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    }

    return this.formatItemForResponse(item);
  }
  async validateCustomId(
    inventoryId: string,
    customId: string,
  ): Promise<{ valid: boolean; message: string }> {
    const inventory = await this.getInventoryWithFields(inventoryId);

    // Use template-based validation
    const template = generateIdTemplate(inventory.idFormat);

    if (template.length !== customId.length) {
      return {
        valid: false,
        message: `Custom ID must be ${template.length} characters`,
      };
    }

    // Check format validity using template
    for (let i = 0; i < template.length; i++) {
      if (template[i] === 'x') {
        const segmentInfo = getSegmentAtPosition(i, inventory.idFormat);
        if (!segmentInfo || !isValidEditableChar(customId[i], segmentInfo)) {
          return {
            valid: false,
            message: `Invalid character at position ${i + 1}`,
          };
        }
      }
    }

    // Check uniqueness
    const existingItem = await this.itemRepository.findOne({
      where: { inventoryId, customId },
    });

    if (existingItem) {
      return {
        valid: false,
        message: 'Custom ID already exists within this inventory',
      };
    }

    return { valid: true, message: 'Custom ID is valid and available' };
  }
}
