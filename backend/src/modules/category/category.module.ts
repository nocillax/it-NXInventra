import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryLookup } from 'src/database/entities/category_lookup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryLookup])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
