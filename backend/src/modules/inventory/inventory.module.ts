import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { Access } from '../../database/entities/access.entity';
import { CustomField } from '../../database/entities/custom_field.entity';
import { Item } from '../../database/entities/item.entity';
import { Tag } from '../../database/entities/tag.entity';
import { TagService } from '../tag/tag.service';
import { User } from '../../database/entities/user.entity';
import { Comment } from '../../database/entities/comment.entity';
import { OdooService } from '../../odoo/odoo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      Access,
      CustomField,
      Item,
      Tag,
      User,
      Comment,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, TagService, OdooService],
})
export class InventoryModule {}
