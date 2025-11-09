import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Item } from '../../database/entities/item.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemFieldValue } from '../../database/entities/item_field_value.entity';
import { generateCustomId } from '../../common/utils/id-generator.util';
import { ItemLike } from '../../database/entities/item_like.entity';
import { PaginationDto } from './dto/pagination.dto';
import * as helpers from './item.helpers';

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

  // This function fetches an inventory with all its custom field definitions loaded
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

  // This function calculates the next sequence number for a new item in the inventory
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

  // This function fetches a complete item with all its field values and field definitions
  private getItemWithRelations(itemId: string): Promise<Item> {
    return this.itemRepository.findOneOrFail({
      where: { id: itemId },
      relations: ['fieldValues', 'fieldValues.field'],
    });
  }

  // This function fetches an item for updating and validates the version for optimistic locking
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

  // This function updates or creates field values for an item within a transaction
  private async updateFieldValues(
    queryRunner: any,
    itemId: string,
    fields: any,
    fieldMap: Map<string, any>,
  ): Promise<void> {
    const safeFields = fields || {};

    const existingValues = await queryRunner.manager.find(ItemFieldValue, {
      where: { itemId },
    });

    // Create a map of existing field values for quick lookup
    const existingValueMap = new Map(
      existingValues.map((value) => [value.fieldId.toString(), value]),
    );

    // Loop through each field to update or create
    for (const [fieldKey, newValue] of Object.entries(safeFields)) {
      const fieldDef = fieldMap.get(fieldKey);
      if (!fieldDef) continue;

      const fieldId = parseInt(fieldKey, 10);

      if (existingValueMap.has(fieldKey)) {
        const existingValue = existingValueMap.get(fieldKey) as ItemFieldValue;
        helpers.updateSingleFieldValue(existingValue, newValue, fieldDef.type);
        await queryRunner.manager.save(ItemFieldValue, existingValue);
      } else {
        const newFieldValue = helpers.createFieldValue(
          itemId,
          fieldId,
          newValue,
          fieldDef.type,
        );
        await queryRunner.manager.save(ItemFieldValue, newFieldValue);
      }
    }
  }

  // This function increments the like count for an item by 1
  private async incrementLikesCount(itemId: string): Promise<void> {
    await this.itemRepository.increment({ id: itemId }, 'likes', 1);
  }

  // This function decrements the like count for an item by 1
  private async decrementLikesCount(itemId: string): Promise<void> {
    await this.itemRepository.decrement({ id: itemId }, 'likes', 1);
  }

  // This function gets the current number of likes for an item
  private async getItemLikesCount(itemId: string): Promise<number> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      select: ['likes'],
    });
    return item?.likes || 0;
  }

  // This function counts the total number of items in an inventory
  private async getTotalItemsCount(inventoryId: string): Promise<number> {
    return this.itemRepository.count({ where: { inventoryId } });
  }

  // This function gets the top 5 users who created the most items in an inventory
  private async getTopContributors(inventoryId: string): Promise<any[]> {
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

    return helpers.formatTopContributors(contributors);
  }

  // This function gets item creation statistics for the last 6 months
  private async getMonthlyGrowth(inventoryId: string): Promise<any[]> {
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

    return helpers.formatMonthlyGrowth(monthlyData);
  }

  // This function gets statistics for a specific field (currently only numeric fields)
  private async getFieldStats(
    inventoryId: string,
    fieldTitle: string,
    fieldType: string,
  ): Promise<any> {
    const inventory = await this.getInventoryWithFields(inventoryId);
    const fieldMap = helpers.createFieldMap(inventory.customFields);

    const fieldDef = Array.from(fieldMap.values()).find(
      (field) => field.title === fieldTitle,
    );
    if (!fieldDef) return null;

    if (fieldType === 'number') {
      return this.getNumericFieldStats(fieldDef.id);
    }

    return null;
  }

  // This function calculates average, min, max, and total for a numeric field
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

    return helpers.formatNumericFieldStats(stats);
  }

  // This function creates a new item with auto-generated custom ID and field values
  async createItem(
    inventoryId: string,
    createItemDto: CreateItemDto,
    userId: string,
  ): Promise<Item> {
    const inventory = await this.getInventoryWithFields(inventoryId);
    const fieldMap = helpers.createFieldMap(inventory.customFields);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const nextSequence = await this.getNextSequenceNumber(
        queryRunner,
        inventory.id,
      );
      const customId = generateCustomId(inventory.idFormat, nextSequence);

      const newItem = this.itemRepository.create({
        inventoryId: inventory.id,
        createdBy: userId,
        sequenceNumber: nextSequence,
        customId,
      });
      const savedItem = await queryRunner.manager.save(Item, newItem);

      const fieldValues = helpers.createFieldValues(
        savedItem.id,
        createItemDto.fields,
        fieldMap,
      );

      if (fieldValues.length > 0) {
        await queryRunner.manager.save(ItemFieldValue, fieldValues);
      }

      await queryRunner.commitTransaction();
      return this.getItemWithRelations(savedItem.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505' && error.detail?.includes('custom_id')) {
        throw new ConflictException(
          'Custom ID already exists. Please try again or edit custom ID manually.',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // This function returns a paginated list of items with their field values
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
      items: items.map((item) => helpers.formatItemForResponse(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // This function updates an item's custom ID and/or field values with version checking
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

      // Validate and update custom ID if provided
      if (customId && customId !== item.customId) {
        const validation = helpers.validateCustomIdEdit(
          item.customId,
          customId,
          item.inventory.idFormat,
        );
        if (!validation.valid) {
          throw new BadRequestException(validation.message);
        }

        if (
          helpers.hasSequenceSegmentChanged(
            item.customId,
            customId,
            item.inventory.idFormat,
          )
        ) {
          const newSequence = helpers.extractSequenceNumberFromId(
            customId,
            item.inventory.idFormat,
          );
          item.sequenceNumber = newSequence;
        }

        item.customId = customId;
      }

      const fieldMap = helpers.createFieldMap(item.inventory.customFields);
      await this.updateFieldValues(queryRunner, itemId, fields, fieldMap);

      item.version += 1;
      await queryRunner.manager.save(Item, item);

      await queryRunner.commitTransaction();
      return this.getItemWithRelations(itemId);
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

  // This function permanently deletes an item from the database
  async remove(itemId: string): Promise<void> {
    const result = await this.itemRepository.delete(itemId);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    }
  }

  // This function returns all custom field definitions for an inventory
  async getInventoryFields(inventoryId: string): Promise<any[]> {
    const inventory = await this.getInventoryWithFields(inventoryId);
    return helpers.formatFieldDefinitions(inventory.customFields);
  }

  // This function adds or removes a like for an item by a user
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

  // This function checks if a user has already liked a specific item
  async hasUserLikedItem(itemId: string, userId: string): Promise<boolean> {
    const like = await this.itemLikeRepository.findOne({
      where: { itemId, userId },
    });
    return !!like;
  }

  // This function returns comprehensive statistics for an inventory including contributors and growth data
  async getInventoryStats(inventoryId: string): Promise<any> {
    // Fetch all core statistics in parallel for better performance
    const [totalItems, topContributors, monthlyGrowth] = await Promise.all([
      this.getTotalItemsCount(inventoryId),
      this.getTopContributors(inventoryId),
      this.getMonthlyGrowth(inventoryId),
    ]);

    // Conditionally get field statistics for Price and Quantity if they exist
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

  // This function returns a single item with all its details and field values
  async findOne(itemId: string): Promise<any> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['fieldValues', 'fieldValues.field'],
    });

    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found.`);
    }

    return helpers.formatItemForResponse(item);
  }

  // This function validates if a custom ID is properly formatted and unique within the inventory
  async validateCustomId(
    inventoryId: string,
    customId: string,
  ): Promise<{ valid: boolean; message: string }> {
    const inventory = await this.getInventoryWithFields(inventoryId);

    const formatValidation = helpers.validateCustomIdFormat(
      customId,
      inventory.idFormat,
    );
    if (!formatValidation.valid) {
      return formatValidation;
    }

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
