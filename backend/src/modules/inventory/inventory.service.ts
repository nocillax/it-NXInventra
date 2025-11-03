import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  CustomField,
  CustomFieldType,
} from '../../database/entities/custom_field.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Access } from '../../database/entities/access.entity';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { TagService } from '../tag/tag.service';
import { Tag } from 'src/database/entities/tag.entity';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AddAccessDto } from './dto/add-access.dto';
import { User } from 'src/database/entities/user.entity';
import { UpdateCustomFieldDto } from './dto/update-custom-fields.dto';
import { AddCustomFieldsDto } from './dto/add-custom-fields.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
    private readonly dataSource: DataSource,
    private readonly tagService: TagService,
  ) {}

  // ========== TINY REUSABLE HELPER FUNCTIONS ==========

  // Helper methods first
  private async validateCurrentUserIsOwner(
    inventoryId: string,
    userId: string,
  ): Promise<void> {
    const access = await this.accessRepository.findOne({
      where: { inventoryId, userId, role: 'Owner' },
    });
    if (!access) {
      throw new ForbiddenException('Only owners can manage access');
    }
  }

  private async getOwnerCount(inventoryId: string): Promise<number> {
    return this.accessRepository.count({
      where: { inventoryId, role: 'Owner' },
    });
  }

  private async validateNotLastOwner(
    inventoryId: string,
    targetUserId: string,
  ): Promise<void> {
    const ownerCount = await this.getOwnerCount(inventoryId);
    const targetUserAccess = await this.accessRepository.findOne({
      where: { inventoryId, userId: targetUserId },
    });

    if (targetUserAccess?.role === 'Owner' && ownerCount <= 1) {
      throw new ForbiddenException('Cannot remove or change the last owner');
    }
  }
  // Add this new helper method for transaction-safe tag syncing
  private async syncInventoryTagsInTransaction(
    queryRunner: QueryRunner,
    inventoryId: string,
    tagNames: string[],
  ): Promise<void> {
    const inventory = await queryRunner.manager.findOne(Inventory, {
      where: { id: inventoryId },
      relations: ['tags'], // Load the Tag entities
    });

    if (inventory) {
      const tags = await this.findOrCreateTagsInTransaction(
        queryRunner,
        tagNames,
      );
      inventory.tags = tags; // This now works because tags is Tag[]
      await queryRunner.manager.save(inventory);
    }
  }

  // Let me also create a cleaner helper method for the access checking
  private addNotOwnerCondition(query: any, userId: string): void {
    query
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('access', 'access')
          .where('access.inventoryId = inventory.id')
          .andWhere('access.userId = :userId')
          .andWhere('access.role = :role')
          .getQuery();
        return `NOT EXISTS (${subQuery})`;
      })
      .setParameter('userId', userId)
      .setParameter('role', 'Owner');
  }

  // Add this helper to create tags within transaction
  private async findOrCreateTagsInTransaction(
    queryRunner: QueryRunner,
    tagNames: string[],
  ): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    // Find existing tags
    const existingTags = await queryRunner.manager
      .createQueryBuilder(Tag, 'tag')
      .where('tag.name IN (:...tagNames)', { tagNames })
      .getMany();

    const existingTagNames = new Set(existingTags.map((tag) => tag.name));
    const newTagNames = tagNames.filter((name) => !existingTagNames.has(name));

    // Create new tags
    const newTags = newTagNames.map((name) => {
      const tag = new Tag();
      tag.name = name;
      return tag;
    });

    const savedNewTags = await queryRunner.manager.save(Tag, newTags);
    return [...existingTags, ...savedNewTags];
  }

  private async runTransaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private createInventoryEntity(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Inventory {
    // Create the entity without tags first, then handle tags separately
    const { tags, ...dtoWithoutTags } = createInventoryDto;

    return this.inventoryRepository.create({
      ...dtoWithoutTags,
      createdBy: userId,
      // Add default ID format here
      idFormat: [
        { id: 'seg1', type: 'fixed', value: 'ITEM-' },
        { id: 'seg2', type: 'sequence', format: 'D3' },
      ],
      // Don't set tags here - they'll be handled by syncInventoryTags
    });
  }

  private createOwnerAccess(inventoryId: string, userId: string): Access {
    return this.accessRepository.create({
      inventoryId,
      userId,
      role: 'Owner',
    });
  }

  private async validateInventoryExists(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID "${id}" not found.`);
    }
    return inventory;
  }

  private async checkUserAccess(
    inventoryId: string,
    userId: string,
  ): Promise<void> {
    const access = await this.accessRepository.findOneBy({
      inventoryId,
      userId,
    });
    if (!access) {
      throw new ForbiddenException('You do not have access to this inventory.');
    }
  }

  private mapCustomFieldType(dtoType: string): CustomFieldType {
    const typeMap = {
      longtext: 'textarea' as CustomFieldType,
      url: 'link' as CustomFieldType,
      text: 'text' as CustomFieldType,
      number: 'number' as CustomFieldType,
      boolean: 'boolean' as CustomFieldType,
    };
    return typeMap[dtoType] || 'text';
  }

  private extractCustomFieldIds(customFields: any[]): Set<number> {
    return new Set(
      customFields.map((f) => parseInt(f.id, 10)).filter((id) => !isNaN(id)),
    );
  }

  private async getExistingCustomFields(
    queryRunner: QueryRunner,
    inventoryId: string,
  ): Promise<CustomField[]> {
    return queryRunner.manager.find(CustomField, {
      where: { inventoryId },
    });
  }

  private createCustomFieldEntity(
    fieldDto: any,
    inventoryId: string,
    index: number,
  ): Partial<CustomField> {
    return {
      id: fieldDto.id ? parseInt(fieldDto.id, 10) : undefined,
      inventoryId,
      orderIndex: index,
      title: fieldDto.title,
      type: this.mapCustomFieldType(fieldDto.type),
      showInTable: fieldDto.showInTable,
    };
  }

  private async deleteRemovedFields(
    queryRunner: QueryRunner,
    fieldsToDelete: CustomField[],
  ): Promise<void> {
    if (fieldsToDelete.length > 0) {
      await queryRunner.manager.remove(fieldsToDelete);
    }
  }

  private async saveCustomFields(
    queryRunner: QueryRunner,
    fieldEntities: Partial<CustomField>[],
  ): Promise<void> {
    for (const fieldEntity of fieldEntities) {
      await queryRunner.manager.save(CustomField, fieldEntity);
    }
  }

  // ========== MAIN SERVICE METHODS (NOW SIMPLIFIED) ==========

  async create(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    return this.runTransaction(async (queryRunner) => {
      const newInventory = this.createInventoryEntity(
        createInventoryDto,
        userId,
      );
      const savedInventory = await queryRunner.manager.save(newInventory);

      const ownerAccess = this.createOwnerAccess(savedInventory.id, userId);
      await queryRunner.manager.save(ownerAccess);

      // Handle tags INSIDE the transaction
      if (createInventoryDto.tags && createInventoryDto.tags.length > 0) {
        await this.syncInventoryTagsInTransaction(
          queryRunner,
          savedInventory.id,
          createInventoryDto.tags,
        );
      }

      // Return the inventory with tags loaded - ensure it's not null
      const finalInventory = await queryRunner.manager.findOne(Inventory, {
        where: { id: savedInventory.id },
        relations: ['tags'],
      });

      if (!finalInventory) {
        throw new NotFoundException(
          'Inventory was created but could not be retrieved',
        );
      }

      return finalInventory;
    });
  }

  async findOne(id: string, userId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.customFields', 'customFields')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect('inventory.accessRecords', 'accessRecords')
      .where('inventory.id = :id', { id })
      .getOne();

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    // Skip access checks and just return the inventory with all relations
    return inventory;
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    // Extract tags separately and handle the rest
    const { customFields, tags, ...inventoryData } = updateInventoryDto;

    return this.runTransaction(async (queryRunner) => {
      // Update basic inventory data (without tags)
      await queryRunner.manager.update(Inventory, id, inventoryData);

      if (customFields) {
        await this.syncCustomFields(queryRunner, id, customFields);
      }

      // Handle tags separately - this will convert string[] to Tag[]
      if (tags !== undefined) {
        await this.syncInventoryTagsInTransaction(queryRunner, id, tags);
      }

      const updatedInventory = await this.inventoryRepository.findOne({
        where: { id },
        relations: ['customFields', 'tags'],
      });

      if (!updatedInventory) {
        throw new NotFoundException(`Inventory with ID "${id}" not found`);
      }
      return updatedInventory;
    });
  }

  private async syncCustomFields(
    queryRunner: QueryRunner,
    inventoryId: string,
    customFields: any[],
  ): Promise<void> {
    const existingFields = await this.getExistingCustomFields(
      queryRunner,
      inventoryId,
    );
    const existingFieldIds = new Set(existingFields.map((f) => f.id));
    const incomingFieldIds = this.extractCustomFieldIds(customFields);

    const fieldsToDelete = existingFields.filter(
      (f) => !incomingFieldIds.has(f.id),
    );
    await this.deleteRemovedFields(queryRunner, fieldsToDelete);

    const fieldEntities = customFields.map((fieldDto, index) =>
      this.createCustomFieldEntity(fieldDto, inventoryId, index),
    );

    await this.saveCustomFields(queryRunner, fieldEntities);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.inventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory with ID "${id}" not found`);
    }
  }

  async findAllPublic(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.customFields', 'customFields')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect(
        'inventory.accessRecords',
        'accessRecords',
        'accessRecords.userId = :userId',
        { userId },
      )
      .where('inventory.public = :isPublic', { isPublic: true });

    // Use the helper method
    this.addNotOwnerCondition(query, userId);

    const [inventories, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('inventory.createdAt', 'DESC')
      .getManyAndCount();

    return {
      inventories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findWithPagination(
    inventoryQueryDto: InventoryQueryDto,
    userId?: string,
  ): Promise<any> {
    const {
      page,
      limit,
      category,
      tags,
      public: isPublic,
      search,
    } = inventoryQueryDto;
    const skip = (page - 1) * limit;

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.customFields', 'customFields')
      .leftJoinAndSelect('inventory.tags', 'tags');

    // Apply filters
    if (category) {
      query.andWhere('inventory.category = :category', { category });
    }

    if (tags && tags.length > 0) {
      query.andWhere('inventory.tags && :tags', { tags });
    }

    // Handle public filter and access logic
    if (isPublic !== undefined) {
      query.andWhere('inventory.public = :isPublic', { isPublic });
    } else {
      // If no public filter specified:
      if (userId) {
        // For authenticated users: show public inventories where they're NOT owners
        query.andWhere('inventory.public = :isPublic', { isPublic: true });
        this.addNotOwnerCondition(query, userId);
      } else {
        // For guest users: only show public inventories
        query.andWhere('inventory.public = :isPublic', { isPublic: true });
      }
    }

    if (search) {
      query.andWhere(
        '(inventory.title ILIKE :search OR inventory.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [inventories, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('inventory.createdAt', 'DESC')
      .getManyAndCount();

    return {
      inventories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Main access management methods
  async addAccess(
    inventoryId: string,
    addAccessDto: AddAccessDto,
    currentUserId: string,
  ): Promise<Access> {
    await this.validateCurrentUserIsOwner(inventoryId, currentUserId);

    // Check if user exists
    const userExists = await this.dataSource.getRepository(User).findOne({
      where: { id: addAccessDto.userId },
    });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    // Check if user already has access
    const existingAccess = await this.accessRepository.findOne({
      where: { inventoryId, userId: addAccessDto.userId },
    });
    if (existingAccess) {
      throw new ConflictException('User already has access to this inventory');
    }

    const newAccess = this.accessRepository.create({
      inventoryId,
      userId: addAccessDto.userId,
      role: addAccessDto.role,
    });

    return this.accessRepository.save(newAccess);
  }

  async getAccessList(
    inventoryId: string,
    currentUserId: string,
  ): Promise<any[]> {
    // Verify current user has access to this inventory
    await this.findOne(inventoryId, currentUserId);

    const accessList = await this.accessRepository.find({
      where: { inventoryId },
      relations: ['user'],
    });

    return accessList.map((access) => ({
      userId: access.userId,
      userName: access.user.name,
      userEmail: access.user.email,
      role: access.role,
      createdAt: access.createdAt,
    }));
  }

  async updateAccess(
    inventoryId: string,
    targetUserId: string,
    updateAccessDto: UpdateAccessDto,
    currentUserId: string,
  ): Promise<Access> {
    await this.validateCurrentUserIsOwner(inventoryId, currentUserId);
    await this.validateNotLastOwner(inventoryId, targetUserId);

    const access = await this.accessRepository.findOne({
      where: { inventoryId, userId: targetUserId },
    });

    if (!access) {
      throw new NotFoundException('Access record not found');
    }

    access.role = updateAccessDto.role;
    return this.accessRepository.save(access);
  }

  async removeAccess(
    inventoryId: string,
    targetUserId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    await this.validateCurrentUserIsOwner(inventoryId, currentUserId);
    await this.validateNotLastOwner(inventoryId, targetUserId);

    // Prevent self-removal if you're the only owner
    if (targetUserId === currentUserId) {
      const ownerCount = await this.getOwnerCount(inventoryId);
      if (ownerCount <= 1) {
        throw new ForbiddenException(
          'Cannot remove yourself as the last owner',
        );
      }
    }

    const result = await this.accessRepository.delete({
      inventoryId,
      userId: targetUserId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Access record not found');
    }

    return { message: 'Access removed successfully' };
  }

  async findMyInventories(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [inventories, total] = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoin(
        'inventory.accessRecords',
        'access',
        'access.userId = :userId AND access.role = :role',
        {
          userId,
          role: 'Owner',
        },
      )
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.customFields', 'customFields')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect(
        'inventory.accessRecords',
        'accessRecords',
        'accessRecords.userId = :userId',
        { userId },
      )
      .skip(skip)
      .take(limit)
      .orderBy('inventory.createdAt', 'DESC')
      .getManyAndCount();

    return {
      inventories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findSharedWithMe(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const [inventories, total] = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .innerJoin(
        'inventory.accessRecords',
        'access',
        'access.userId = :userId AND access.role IN (:...roles)',
        {
          userId,
          roles: ['Editor', 'Viewer'],
        },
      )
      .where('inventory.public = :isPublic', { isPublic: false })
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.customFields', 'customFields')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .leftJoinAndSelect(
        'inventory.accessRecords',
        'accessRecords',
        'accessRecords.userId = :userId',
        { userId },
      )
      .skip(skip)
      .take(limit)
      .orderBy('inventory.createdAt', 'DESC')
      .getManyAndCount();

    return {
      inventories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyAccess(
    inventoryId: string,
    userId: string,
  ): Promise<{ role: string }> {
    const access = await this.accessRepository.findOne({
      where: { inventoryId, userId },
    });

    if (!access) {
      throw new NotFoundException('You do not have access to this inventory');
    }

    return { role: access.role };
  }

  async getCustomFields(
    inventoryId: string,
    userId: string,
  ): Promise<CustomField[]> {
    // Verify user has access to the inventory
    await this.checkUserAccess(inventoryId, userId);

    return this.customFieldRepository.find({
      where: { inventoryId },
      order: { orderIndex: 'ASC' }, // Order by orderIndex ASC as requested
    });
  }

  async addCustomFields(
    inventoryId: string,
    addCustomFieldsDto: AddCustomFieldsDto,
    userId: string,
  ): Promise<CustomField[]> {
    // Verify user has owner/editor access
    await this.validateCurrentUserIsOwnerOrEditor(inventoryId, userId);

    return this.runTransaction(async (queryRunner) => {
      // Validate no duplicate field names in the request
      await this.validateNoDuplicateFieldNames(
        queryRunner,
        inventoryId,
        addCustomFieldsDto.fields,
        null, // No existing field to exclude (new fields)
      );

      // Get existing fields to calculate orderIndex for new fields
      const existingFields = await queryRunner.manager.find(CustomField, {
        where: { inventoryId },
        order: { orderIndex: 'DESC' },
      });

      const highestOrderIndex =
        existingFields.length > 0 ? existingFields[0].orderIndex : -1;

      const fieldEntities = addCustomFieldsDto.fields.map((fieldDto, index) => {
        // Use provided orderIndex if exists, otherwise calculate it
        const orderIndex =
          fieldDto.orderIndex !== undefined
            ? fieldDto.orderIndex
            : highestOrderIndex + 1 + index;

        return this.createCustomFieldEntity(
          { ...fieldDto, orderIndex }, // Pass the calculated orderIndex
          inventoryId,
          orderIndex, // Or pass it as separate parameter if needed
        );
      });

      const savedFields = await queryRunner.manager.save(
        CustomField,
        fieldEntities,
      );
      return savedFields;
    });
  }
  async updateCustomField(
    inventoryId: string,
    fieldId: number,
    updateCustomFieldDto: UpdateCustomFieldDto,
    userId: string,
  ): Promise<CustomField> {
    // Verify user has owner/editor access
    await this.validateCurrentUserIsOwnerOrEditor(inventoryId, userId);

    const field = await this.customFieldRepository.findOne({
      where: { id: fieldId, inventoryId },
    });

    if (!field) {
      throw new NotFoundException(`Custom field with ID ${fieldId} not found`);
    }

    // Prevent type modification
    if (updateCustomFieldDto.type && updateCustomFieldDto.type !== field.type) {
      throw new ForbiddenException('Cannot change custom field type');
    }

    // Validate no duplicate field names (excluding current field)
    if (updateCustomFieldDto.title) {
      await this.validateNoDuplicateFieldNames(
        null, // No query runner needed for simple validation
        inventoryId,
        [{ title: updateCustomFieldDto.title }],
        fieldId,
      );
    }

    // Only allow updating specific fields
    const { title, description, showInTable, orderIndex } =
      updateCustomFieldDto;

    if (title !== undefined) field.title = title;
    if (description !== undefined) field.description = description;
    if (showInTable !== undefined) field.showInTable = showInTable;
    if (orderIndex !== undefined) field.orderIndex = orderIndex;

    return this.customFieldRepository.save(field);
  }

  async deleteCustomField(
    inventoryId: string,
    fieldId: number,
    userId: string,
  ): Promise<{ message: string }> {
    // Verify user has owner/editor access
    await this.validateCurrentUserIsOwnerOrEditor(inventoryId, userId);

    const field = await this.customFieldRepository.findOne({
      where: { id: fieldId, inventoryId },
    });

    if (!field) {
      throw new NotFoundException(`Custom field with ID ${fieldId} not found`);
    }

    await this.customFieldRepository.remove(field);

    return { message: 'Custom field deleted successfully' };
  }

  // Helper method to validate owner or editor access
  private async validateCurrentUserIsOwnerOrEditor(
    inventoryId: string,
    userId: string,
  ): Promise<void> {
    const access = await this.accessRepository.findOne({
      where: {
        inventoryId,
        userId,
        role: In(['Owner', 'Editor']),
      },
    });

    if (!access) {
      throw new ForbiddenException(
        'Only owners or editors can manage custom fields',
      );
    }
  }

  // Helper method to validate no duplicate field names
  private async validateNoDuplicateFieldNames(
    queryRunner: QueryRunner | null,
    inventoryId: string,
    fields: Array<{ title: string }>,
    excludeFieldId: number | null = null,
  ): Promise<void> {
    const fieldTitles = fields.map((f) => f.title.toLowerCase());
    const duplicateTitles = fieldTitles.filter(
      (title, index) => fieldTitles.indexOf(title) !== index,
    );

    if (duplicateTitles.length > 0) {
      throw new ConflictException(
        `Duplicate field names found: ${duplicateTitles.join(', ')}`,
      );
    }

    // Check against existing fields in database
    const repository = queryRunner
      ? queryRunner.manager.getRepository(CustomField)
      : this.customFieldRepository;

    const query = repository
      .createQueryBuilder('field')
      .where('field.inventoryId = :inventoryId', { inventoryId })
      .andWhere('LOWER(field.title) IN (:...titles)', { titles: fieldTitles });

    if (excludeFieldId !== null) {
      query.andWhere('field.id != :excludeFieldId', { excludeFieldId });
    }

    const existingFields = await query.getMany();

    if (existingFields.length > 0) {
      const existingTitles = existingFields.map((f) => f.title);
      throw new ConflictException(
        `Field names already exist in this inventory: ${existingTitles.join(', ')}`,
      );
    }
  }

  async getInventoryIdFormat(
    inventoryId: string,
    userId: string,
  ): Promise<string> {
    // Verify inventory exists and user has access
    await this.checkUserAccess(inventoryId, userId);

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory with ID "${inventoryId}" not found`,
      );
    }

    if (!inventory.idFormat || inventory.idFormat.length === 0) {
      return ''; // Return empty string if no format defined
    }

    // Convert idFormat array to concatenated string pattern
    const formatParts = inventory.idFormat.map((segment) => {
      if (segment.type === 'fixed') {
        return segment.value || '';
      } else if (segment.type === 'random_6digit') {
        return 'rand6';
      } else if (segment.type === 'random_9digit') {
        return 'rand9';
      } else {
        // For all other types (date, sequence, random_20bit, random_32bit, guid)
        // Just use the format field if present, otherwise use type as fallback
        return segment.format || segment.type;
      }
    });

    return formatParts.join('');
  }
}
