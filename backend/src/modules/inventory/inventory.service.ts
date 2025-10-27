import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Access } from '../../database/entities/access.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createInventoryDto: CreateInventoryDto,
    userId: string,
  ): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newInventory = this.inventoryRepository.create({
        ...createInventoryDto,
        createdBy: userId,
      });

      const savedInventory = await queryRunner.manager.save(newInventory);

      const ownerAccess = this.accessRepository.create({
        inventoryId: savedInventory.id,
        userId: userId,
        role: 'Owner',
      });

      await queryRunner.manager.save(ownerAccess);

      await queryRunner.commitTransaction();
      return savedInventory;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllPublic(): Promise<Inventory[]> {
    return this.inventoryRepository.find({ where: { public: true } });
  }

  async findOne(id: string, userId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOneBy({ id });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID "${id}" not found.`);
    }

    if (inventory.public) {
      return inventory;
    }

    const access = await this.accessRepository.findOneBy({
      inventoryId: id,
      userId,
    });

    if (!access) {
      throw new ForbiddenException('You do not have access to this inventory.');
    }

    return inventory;
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    userId: string, // userId is passed for consistency, though guard handles auth
  ) {
    const inventory = await this.inventoryRepository.preload({
      id,
      ...updateInventoryDto,
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID "${id}" not found`);
    }
    return this.inventoryRepository.save(inventory);
  }

  async remove(id: string, userId: string) {
    // The RolesGuard already ensures the user is an Owner.
    const result = await this.inventoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory with ID "${id}" not found`);
    }
  }
}
