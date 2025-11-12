import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { Item } from '../../database/entities/item.entity';
import { DataSource, Repository } from 'typeorm';
import { buildWildcardQuery } from './search.helpers';
import { UserService } from '../user/user.service';
@Injectable()
export class SearchService {
  constructor(
    private dataSource: DataSource,
    private userService: UserService,
  ) {}

  async globalSearch(
    query: string,
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const searchQuery = query.trim();
    if (!searchQuery) {
      return { inventories: [], items: [] };
    }
    const wildcardQuery = buildWildcardQuery(searchQuery);
    const [inventories, items] = await Promise.all([
      this.searchInventories(wildcardQuery, userId, page, limit),
      this.searchItems(wildcardQuery, userId, page, limit),
    ]);
    return { inventories, items };
  }

  // This function searches inventories matching the wildcard query and user access
  private async searchInventories(
    wildcardQuery: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<Inventory[]> {
    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      try {
        // Use the userService to check admin status
        const user = await this.userService.getUserById(userId);
        isAdmin = user.isAdmin;
      } catch (error) {
        // User not found or not admin
        isAdmin = false;
      }
    }

    let query = this.dataSource
      .createQueryBuilder()
      .select('inventory')
      .from(Inventory, 'inventory')
      .where(`inventory.search_vector @@ to_tsquery('english', :wildcardQuery)`)
      .setParameter('wildcardQuery', wildcardQuery);

    // If user is not admin, apply the normal access restrictions
    if (!isAdmin) {
      query = query
        .andWhere(
          `(inventory.public = true OR EXISTS (
        SELECT 1 FROM access a WHERE a.inventory_id = inventory.id AND a.user_id = :userId
      ))`,
        )
        .setParameter('userId', userId);
    }

    return query
      .orderBy(
        `ts_rank_cd(inventory.search_vector, to_tsquery('english', :wildcardQuery))`,
        'DESC',
      )
      .addOrderBy('inventory.created_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getMany();
  }

  // This function searches items matching the wildcard query and user access
  private async searchItems(
    wildcardQuery: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      try {
        // Use the userService to check admin status
        const user = await this.userService.getUserById(userId);
        isAdmin = user.isAdmin;
      } catch (error) {
        // User not found or not admin
        isAdmin = false;
      }
    }

    let query = this.dataSource
      .createQueryBuilder()
      .select('item')
      .from(Item, 'item')
      .innerJoin('item.inventory', 'inventory')
      .where(`item.search_vector @@ to_tsquery('english', :wildcardQuery)`)
      .setParameter('wildcardQuery', wildcardQuery);

    // If user is not admin, apply the normal access restrictions
    if (!isAdmin) {
      query = query
        .andWhere(
          `(inventory.public = true OR EXISTS (
        SELECT 1 FROM access a WHERE a.inventory_id = inventory.id AND a.user_id = :userId
      ))`,
        )
        .setParameter('userId', userId);
    }

    return query
      .orderBy(
        `ts_rank_cd(item.search_vector, to_tsquery('english', :wildcardQuery))`,
        'DESC',
      )
      .addOrderBy('item.created_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit)
      .getMany();
  }
}
