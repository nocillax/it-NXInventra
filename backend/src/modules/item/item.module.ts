import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../../database/entities/item.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { Access } from '../../database/entities/access.entity';
import { ItemFieldValue } from '../../database/entities/item_field_value.entity';
import { AuthModule } from '../auth/auth.module';
import { ItemLike } from '../../database/entities/item_like.entity';
import { Comment } from '../../database/entities/comment.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Item,
      Inventory,
      Access,
      ItemFieldValue,
      ItemLike,
      Comment,
      User,
    ]),
    AuthModule,
  ],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
