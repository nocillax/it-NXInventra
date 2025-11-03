// src/migrations/1719981234567-AddFullTextSearch.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullTextSearch1719981234567 implements MigrationInterface {
  name = 'AddFullTextSearch1719981234567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add search_vector column to inventories
    await queryRunner.query(`
            ALTER TABLE inventories 
            ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
                setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
                setweight(to_tsvector('english', coalesce(category, '')), 'C')
            ) STORED;
        `);

    // Create GIN index for inventories
    await queryRunner.query(`
            CREATE INDEX idx_inventories_search_vector 
            ON inventories USING GIN (search_vector);
        `);

    // Add search_vector column to items
    await queryRunner.query(`
            ALTER TABLE items 
            ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
                setweight(to_tsvector('english', coalesce(custom_id, '')), 'A')
            ) STORED;
        `);

    // Create GIN index for items
    await queryRunner.query(`
            CREATE INDEX idx_items_search_vector 
            ON items USING GIN (search_vector);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_inventories_search_vector;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_items_search_vector;`);

    // Drop columns
    await queryRunner.query(
      `ALTER TABLE inventories DROP COLUMN IF EXISTS search_vector;`,
    );
    await queryRunner.query(
      `ALTER TABLE items DROP COLUMN IF EXISTS search_vector;`,
    );
  }
}
