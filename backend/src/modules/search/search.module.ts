// src/modules/search/search.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Inventory } from '../../database/entities/inventory.entity';
import { Item } from '../../database/entities/item.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Item]), UserModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
