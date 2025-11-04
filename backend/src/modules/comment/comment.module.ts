import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from '../../database/entities/comment.entity';
import { Access } from '../../database/entities/access.entity';
import { Item } from '../../database/entities/item.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Access, Item, Inventory, User])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
