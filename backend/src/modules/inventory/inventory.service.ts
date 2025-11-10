import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { CustomField } from '../../database/entities/custom_field.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Access } from '../../database/entities/access.entity';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { TagService } from '../tag/tag.service';
import { Tag } from '../../database/entities/tag.entity';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AddAccessDto } from './dto/add-access.dto';
import { User } from '../../database/entities/user.entity';
import { UpdateCustomFieldDto } from './dto/update-custom-fields.dto';
import { AddCustomFieldsDto } from './dto/add-custom-fields.dto';
import * as helpers from './inventory.helpers';

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

  // This function counts how many owners an inventory has
  private async getOwnerCount(inventoryId: string): Promise<number> {
    return this.accessRepository.count({
      where: { inventoryId, role: 'Owner' },
    });
  }

  // This function ensures we don't remove or modify the last owner of an inventory
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

  // This function updates inventory tags within a transaction (finding or creating tags as needed)
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

  // This function finds existing tags or creates new ones within a database transaction
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

    const { newTagNames } = helpers.categorizeTagNames(tagNames, existingTags);
    const newTags = helpers.createTagEntities(newTagNames);

    const savedNewTags = await queryRunner.manager.save(Tag, newTags);
    return [...existingTags, ...savedNewTags];
  }

  // This function wraps database operations in a transaction with automatic rollback on error
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

  // This function creates an inventory entity with default ID format and creator info
  private createInventoryEntity(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Inventory {
    const entityData = helpers.createInventoryEntityData(
      createInventoryDto,
      userId,
    );
    return this.inventoryRepository.create(entityData);
  }

  // This function creates a new inventory with owner access and optional tags
  async create(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    return this.runTransaction(async (queryRunner) => {
      const savedInventory = await this.saveNewInventory(
        queryRunner,
        createInventoryDto,
        userId,
      );

      await this.grantOwnerAccess(queryRunner, savedInventory.id, userId);

      if (createInventoryDto.tags?.length) {
        await this.syncInventoryTagsInTransaction(
          queryRunner,
          savedInventory.id,
          createInventoryDto.tags,
        );
      }

      return await this.loadFinalInventory(queryRunner, savedInventory.id);
    });
  }

  // Saves a new inventory entity to the database inside a transaction
  private async saveNewInventory(
    queryRunner: QueryRunner,
    dto: CreateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    const entity = this.createInventoryEntity(dto, userId);
    return await queryRunner.manager.save(entity);
  }

  // Assigns owner-level access to the user for the newly created inventory
  private async grantOwnerAccess(
    queryRunner: QueryRunner,
    inventoryId: string,
    userId: string,
  ): Promise<void> {
    const access = this.accessRepository.create({
      inventoryId,
      userId,
      role: 'Owner',
    });
    await queryRunner.manager.save(access);
  }

  // Loads the inventory from the database along with its tags after creation
  private async loadFinalInventory(
    queryRunner: QueryRunner,
    inventoryId: string,
  ): Promise<Inventory> {
    const inventory = await queryRunner.manager.findOne(Inventory, {
      where: { id: inventoryId },
      relations: ['tags'],
    });

    if (!inventory) {
      throw new NotFoundException(
        'Inventory was created but could not be retrieved',
      );
    }

    return inventory;
  }

  // Returns inventory details for public/private inventories with RBAC
  async getInventoryDetails(id: string, userId?: string): Promise<Inventory> {
    // Fetch inventory with explicit relations (no eager loading)
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

    // If public, return full data
    if (inventory.public) {
      return inventory;
    }

    // If private, check user
    if (!userId) {
      throw new UnauthorizedException('Please log in to see details');
    }

    // Check access table for permission
    // const access = await this.accessRepository.findOne({
    //   where: { inventoryId: id, userId },
    // });
    // if (!access) {
    //   throw new ForbiddenException('You do not have access to this inventory');
    // }
    return inventory;
  }

  // This function updates inventory details including custom fields and tags
  async updateInventory(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    this.validateUserId(userId);
    const { customFields, tags, ...inventoryData } = updateInventoryDto;

    return this.runTransaction(async (queryRunner) => {
      await this.updateBasicInventory(queryRunner, id, inventoryData);

      if (customFields) {
        await this.syncCustomFields(queryRunner, id, customFields);
      }

      if (tags !== undefined) {
        await this.syncInventoryTagsInTransaction(queryRunner, id, tags);
      }

      return await this.loadUpdatedInventory(id);
    });
  }

  // This function updates basic inventory fields like name, description, etc.
  private async updateBasicInventory(
    queryRunner: QueryRunner,
    id: string,
    inventoryData: Partial<Inventory>,
  ): Promise<void> {
    await queryRunner.manager.update(Inventory, id, inventoryData);
  }

  // This function loads the updated inventory with its custom fields and tags
  private async loadUpdatedInventory(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['customFields', 'tags'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID "${id}" not found`);
    }

    return inventory;
  }

  // This function synchronizes custom fields by adding new ones and removing deleted ones
  private async syncCustomFields(
    queryRunner: QueryRunner,
    inventoryId: string,
    customFields: any[],
  ): Promise<void> {
    const existingFields = await queryRunner.manager.find(CustomField, {
      where: { inventoryId },
    });
    const incomingFieldIds = helpers.extractCustomFieldIds(customFields);
    const fieldsToDelete = helpers.identifyFieldsToDelete(
      existingFields,
      incomingFieldIds,
    );

    if (fieldsToDelete.length > 0) {
      await queryRunner.manager.remove(fieldsToDelete);
    }

    const fieldEntities = customFields.map((fieldDto, index) =>
      helpers.createCustomFieldEntity(fieldDto, inventoryId, index),
    );

    for (const fieldEntity of fieldEntities) {
      await queryRunner.manager.save(CustomField, fieldEntity);
    }
  }

  // This function permanently deletes an inventory from the database
  async removeInventory(id: string): Promise<void> {
    const result = await this.inventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory with ID "${id}" not found`);
    }
  }

  // This function returns all public inventories
  async findAllPublic(page: number = 1, limit: number = 10): Promise<any> {
    const skip = helpers.calculateSkip(page, limit);

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.creator', 'creator')
      .leftJoinAndSelect('inventory.customFields', 'customFields')
      .leftJoinAndSelect('inventory.tags', 'tags')
      .where('inventory.public = :isPublic', { isPublic: true });

    const [inventories, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('inventory.createdAt', 'DESC')
      .getManyAndCount();

    return helpers.createPaginationResponse(
      inventories,
      page,
      limit,
      total,
      'inventories',
    );
  }

  // This function searches inventories with filters (category, tags, public status, search text)
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
    const skip = helpers.calculateSkip(page, limit);

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
      query
        .andWhere((qb) => helpers.buildTagFilterSubQuery(qb))
        .setParameter('tags', tags);
    }

    // Handle public filter and access logic - REPLACE THIS ENTIRE BLOCK
    if (isPublic !== undefined) {
      query.andWhere('inventory.public = :isPublic', { isPublic });
    } else {
      // If no public filter specified:
      if (userId) {
        // For authenticated users: show ALL inventories they have access to
        // This includes: public inventories + private inventories they own/have access to
        query.andWhere(
          '(inventory.public = true OR EXISTS (' +
            'SELECT 1 FROM access a WHERE a.inventory_id = inventory.id AND a.user_id = :userId' +
            '))',
          { userId },
        );
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

    return helpers.createPaginationResponse(
      inventories,
      page,
      limit,
      total,
      'inventories',
    );
  }

  // This function adds a user to an inventory's access list with a specific role
  async addAccess(
    inventoryId: string,
    addAccessDto: AddAccessDto,
  ): Promise<Access> {
    const newAccess = this.accessRepository.create({
      inventoryId,
      userId: addAccessDto.userId,
      role: addAccessDto.role,
    });

    return this.accessRepository.save(newAccess);
  }

  // This function returns a list of all users who have access to an inventory
  async getAccessList(
    inventoryId: string,
    currentUserId: string,
  ): Promise<any[]> {
    // Verify current user has access to this inventory
    await this.getInventoryDetails(inventoryId, currentUserId);

    const accessList = await this.accessRepository.find({
      where: { inventoryId },
      relations: ['user'],
    });

    return helpers.formatAccessList(accessList);
  }

  // This function changes a user's access role for an inventory
  async updateAccess(
    inventoryId: string,
    targetUserId: string,
    updateAccessDto: UpdateAccessDto,
  ): Promise<Access> {
    await this.validateNotLastOwner(inventoryId, targetUserId);

    const access = await this.accessRepository.findOne({
      where: { inventoryId, userId: targetUserId },
    });

    access!.role = updateAccessDto.role;
    return this.accessRepository.save(access!);
  }

  // This function removes a user's access to an inventory
  async removeAccess(
    inventoryId: string,
    targetUserId: string,
  ): Promise<{ message: string }> {
    await this.validateNotLastOwner(inventoryId, targetUserId);

    const result = await this.accessRepository.delete({
      inventoryId,
      userId: targetUserId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Access record not found');
    }

    return { message: 'Access removed successfully' };
  }

  // This function throws an error if userId is missing
  private validateUserId(userId: string | undefined): void {
    if (!userId) {
      throw new UnauthorizedException('Please log in to see details');
    }
  }

  // This function returns a paginated list of inventories owned by the user
  async findMyInventories(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    if (!userId) {
      throw new UnauthorizedException('Please log in to see your inventories');
    }
    const skip = helpers.calculateSkip(page, limit);
    const [inventories, total] = await this.getOwnedInventories(
      userId,
      skip,
      limit,
    );

    return helpers.createPaginationResponse(
      inventories,
      page,
      limit,
      total,
      'inventories',
    );
  }

  // Builds and runs a query to fetch inventories where the user is the owner
  private async getOwnedInventories(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<[Inventory[], number]> {
    return this.inventoryRepository
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
  }

  // This function returns inventories shared with the user (Editor or Viewer role)
  async findSharedWithMe(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = helpers.calculateSkip(page, limit);
    const [inventories, total] = await this.getSharedInventories(
      userId,
      skip,
      limit,
    );

    return helpers.createPaginationResponse(
      inventories,
      page,
      limit,
      total,
      'inventories',
    );
  }

  // This function builds and runs a query to fetch inventories shared with the user (Editor or Viewer)
  private async getSharedInventories(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<[Inventory[], number]> {
    return this.inventoryRepository
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
  }

  // This function returns the user's access role for a specific inventory
  async getMyAccess(
    inventoryId: string,
    userId: string,
  ): Promise<{ role: string }> {
    this.validateUserId(userId);

    const access = await this.accessRepository.findOne({
      where: { inventoryId, userId },
    });

    if (access) {
      return { role: access.role };
    }

    // Check if inventory is public
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });

    if (inventory?.public) {
      return { role: 'Editor' }; // Public inventory + logged in = Editor
    }

    throw new NotFoundException('You do not have access to this inventory');
  }

  // This function retrieves all custom fields for an inventory
  async getCustomFields(
    inventoryId: string,
    userId: string,
  ): Promise<CustomField[]> {
    // Verify user has access to the inventory
    // await this.checkUserAccess(inventoryId, userId);

    return this.customFieldRepository.find({
      where: { inventoryId },
      order: { orderIndex: 'ASC' }, // Order by orderIndex ASC as requested
    });
  }

  // This function adds new custom fields to an inventory
  async addCustomFields(
    inventoryId: string,
    addCustomFieldsDto: AddCustomFieldsDto,
  ): Promise<CustomField[]> {
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

      const startingOrderIndex =
        helpers.calculateNextOrderIndex(existingFields);
      const fieldEntities = helpers.createCustomFieldEntities(
        addCustomFieldsDto.fields,
        inventoryId,
        startingOrderIndex,
      );

      const savedFields = await queryRunner.manager.save(
        CustomField,
        fieldEntities,
      );
      return savedFields;
    });
  }

  // This function updates an existing custom field's properties (except type)
  async updateCustomField(
    inventoryId: string,
    fieldId: number,
    updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<CustomField> {
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

  // This function permanently removes a custom field from an inventory
  async deleteCustomField(
    inventoryId: string,
    fieldId: number,
  ): Promise<{ message: string }> {
    const field = await this.customFieldRepository.findOne({
      where: { id: fieldId, inventoryId },
    });

    if (!field) {
      throw new NotFoundException(`Custom field with ID ${fieldId} not found`);
    }

    await this.customFieldRepository.remove(field);

    return { message: 'Custom field deleted successfully' };
  }

  // This function validates that the user has either Owner or Editor access to the inventory
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

  // This function checks for duplicate field titles both in the request and in the database
  private async validateNoDuplicateFieldNames(
    queryRunner: QueryRunner | null,
    inventoryId: string,
    fields: Array<{ title: string }>,
    excludeFieldId: number | null = null,
  ): Promise<void> {
    // Use helper to check for duplicates in the request
    const validation = helpers.validateNoDuplicateTitles(fields);

    if (!validation.valid) {
      throw new ConflictException(
        `Duplicate field names found: ${validation.duplicates.join(', ')}`,
      );
    }

    // Check against existing fields in database
    const fieldTitles = fields.map((f) => f.title.toLowerCase());
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

  // This function returns the custom ID format string for an inventory
  async getInventoryIdFormat(inventoryId: string): Promise<string> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    return helpers.generateIdFormatString(inventory!.idFormat);
  }
}
