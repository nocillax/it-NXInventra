import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../../database/entities/tag.entity';
import { Repository } from 'typeorm';
@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findOrCreate(tagNames: string[]): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const existingTags = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.name IN (:...tagNames)', { tagNames })
      .getMany();

    const existingTagNames = new Set(existingTags.map((tag) => tag.name));
    const newTagNames = tagNames.filter((name) => !existingTagNames.has(name));

    const newTags = newTagNames.map((name) =>
      this.tagRepository.create({ name }),
    );
    const savedNewTags = await this.tagRepository.save(newTags);

    return [...existingTags, ...savedNewTags];
  }

  async autocomplete(query: string, limit: number = 10): Promise<string[]> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :query', { query: `%${query}%` })
      .orderBy('tag.name', 'ASC')
      .limit(limit)
      .getMany();

    return tags.map((tag) => tag.name);
  }

  async getPopularTags(
    limit: number = 20,
  ): Promise<{ name: string; count: number }[]> {
    const popularTags = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.inventories', 'inventory')
      .select('tag.name', 'name')
      .addSelect('COUNT(inventory.id)', 'count')
      .groupBy('tag.name')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return popularTags.map((tag) => ({
      name: tag.name,
      count: parseInt(tag.count),
    }));
  }

  async getAllTags(page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;

    const [tags, total] = await this.tagRepository.findAndCount({
      relations: ['inventories'],
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    const tagsWithCounts = tags.map((tag) => ({
      id: tag.id, // Now includes ID
      name: tag.name,
      createdAt: tag.createdAt,
      inventoryCount: tag.inventories?.length || 0,
    }));

    // Sort by count descending
    tagsWithCounts.sort((a, b) => b.inventoryCount - a.inventoryCount);

    return {
      tags: tagsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteTag(tagName: string): Promise<{ message: string }> {
    const tag = await this.tagRepository.findOne({ where: { name: tagName } });

    if (!tag) {
      throw new NotFoundException(`Tag "${tagName}" not found`);
    }

    await this.tagRepository.remove(tag);
    return { message: `Tag "${tagName}" deleted successfully` };
  }

  async getTagDetails(tagName: string): Promise<any> {
    const tag = await this.tagRepository.findOne({
      where: { name: tagName },
      relations: ['inventories'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag "${tagName}" not found`);
    }

    return {
      name: tag.name,
      createdAt: tag.createdAt,
      inventoryCount: tag.inventories?.length || 0,
      // Optional: include sample inventories
      sampleInventories: tag.inventories?.slice(0, 5).map((inv) => ({
        id: inv.id,
        title: inv.title,
      })),
    };
  }

  async updateTag(
    oldName: string,
    newName: string,
  ): Promise<{ message: string; tag: Tag }> {
    // Check if old tag exists
    const oldTag = await this.tagRepository.findOne({
      where: { name: oldName },
    });
    if (!oldTag) {
      throw new NotFoundException(`Tag "${oldName}" not found`);
    }

    // Check if new name already exists
    const existingTag = await this.tagRepository.findOne({
      where: { name: newName },
    });
    if (existingTag) {
      throw new ConflictException(`Tag "${newName}" already exists`);
    }

    // Update the tag name - relationships remain intact because they use the ID
    oldTag.name = newName;
    const updatedTag = await this.tagRepository.save(oldTag);

    return {
      message: `Tag renamed from "${oldName}" to "${newName}"`,
      tag: updatedTag,
    };
  }
}
