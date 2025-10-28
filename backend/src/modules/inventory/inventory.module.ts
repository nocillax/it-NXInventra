import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { Access } from '../../database/entities/access.entity';
import { CustomField } from 'src/database/entities/custom_field.entity';
import { Item } from 'src/database/entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Access, CustomField, Item])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
