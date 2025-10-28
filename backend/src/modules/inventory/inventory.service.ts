import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import {
  CustomField,
  CustomFieldType,
} from '../../database/entities/custom_field.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Access } from '../../database/entities/access.entity';

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
  ) {}

  // ========== TINY REUSABLE HELPER FUNCTIONS ==========

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
    return this.inventoryRepository.create({
      ...createInventoryDto,
      createdBy: userId,
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

      return savedInventory;
    });
  }

  async findOne(id: string, userId: string): Promise<Inventory> {
    const inventory = await this.validateInventoryExists(id);

    if (inventory.public) {
      return inventory;
    }

    await this.checkUserAccess(id, userId);
    return inventory;
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    const { customFields, ...inventoryData } = updateInventoryDto;

    return this.runTransaction(async (queryRunner) => {
      await queryRunner.manager.update(Inventory, id, inventoryData);

      if (customFields) {
        await this.syncCustomFields(queryRunner, id, customFields);
      }

      const updatedInventory = await this.inventoryRepository.findOne({
        where: { id },
        relations: ['customFields'],
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
}
