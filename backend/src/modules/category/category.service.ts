import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryLookup } from '../../database/entities/category_lookup.entity';
import { NotFoundException } from '@nestjs/common';
import { isValidCategoryQuery } from './category.helpers';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryLookup)
    private readonly categoryRepository: Repository<CategoryLookup>,
  ) {}

  // This function returns all categories, ordered by name
  async findAll(): Promise<CategoryLookup[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  // This function searches for categories by name if the query is valid, otherwise returns all
  async search(query: string): Promise<CategoryLookup[]> {
    if (!isValidCategoryQuery(query)) {
      return this.findAll();
    }
    return this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name ILIKE :query', { query: `%${query}%` })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  // This function finds a category by its ID, or throws if not found
  async findById(id: number): Promise<CategoryLookup> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
}
