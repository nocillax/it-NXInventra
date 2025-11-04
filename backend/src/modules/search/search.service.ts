import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../../database/entities/inventory.entity';
import { Item } from '../../database/entities/item.entity';
import { DataSource, Repository } from 'typeorm';
import { buildWildcardQuery } from './search.helpers';
@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
    private dataSource: DataSource,
  ) {}

  // This function performs a global search for inventories and items
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
    return this.dataSource
      .createQueryBuilder()
      .select('inventory')
      .from(Inventory, 'inventory')
      .where(
        `(inventory.public = true OR EXISTS (
          SELECT 1 FROM access a WHERE a.inventory_id = inventory.id AND a.user_id = :userId
        )) AND inventory.search_vector @@ to_tsquery('english', :wildcardQuery)`,
      )
      .setParameters({ userId, wildcardQuery })
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
    return this.dataSource
      .createQueryBuilder()
      .select('item')
      .from(Item, 'item')
      .innerJoin('item.inventory', 'inventory')
      .where(
        `(inventory.public = true OR EXISTS (
          SELECT 1 FROM access a WHERE a.inventory_id = inventory.id AND a.user_id = :userId
        )) AND item.search_vector @@ to_tsquery('english', :wildcardQuery)`,
      )
      .setParameters({ userId, wildcardQuery })
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
