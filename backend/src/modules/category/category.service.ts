import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryLookup } from 'src/database/entities/category_lookup.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryLookup)
    private readonly categoryRepository: Repository<CategoryLookup>,
  ) {}

  async findAll(): Promise<CategoryLookup[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async search(query: string): Promise<CategoryLookup[]> {
    if (!query || query.length < 2) {
      return this.findAll();
    }

    return this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name ILIKE :query', { query: `%${query}%` })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  async findById(id: number): Promise<CategoryLookup> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }
}
