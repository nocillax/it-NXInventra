import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from 'src/database/entities/inventory.entity';
import { Item } from 'src/database/entities/item.entity';
import { DataSource, Repository } from 'typeorm';

// search.service.ts
// search.service.ts
@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
    private dataSource: DataSource,
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

    // Convert to wildcard query for both searches
    const wildcardQuery = this.buildWildcardQuery(searchQuery);

    const [inventories, items] = await Promise.all([
      this.searchInventories(wildcardQuery, userId, page, limit),
      this.searchItems(wildcardQuery, userId, page, limit),
    ]);

    return { inventories, items };
  }

  private buildWildcardQuery(query: string): string {
    return query
      .split(' ')
      .filter((term) => term.length > 0)
      .map((term) => `${term}:*`)
      .join(' & ');
  }

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
