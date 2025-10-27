import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { Access } from '../../database/entities/access.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Access])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
