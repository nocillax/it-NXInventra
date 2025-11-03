// src/migrations/1719981234567-AddFullTextSearch.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullTextSearch1719981234567 implements MigrationInterface {
  name = 'AddFullTextSearch1719981234567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if search_vector column exists in inventories
    const inventoryTable = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inventories' AND column_name = 'search_vector'
    `);

    // Only add column if it doesn't exist
    if (inventoryTable.length === 0) {
      await queryRunner.query(`
        ALTER TABLE inventories 
        ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(category, '')), 'C')
        ) STORED;
      `);
    }

    // Check if index exists
    const inventoryIndex = await queryRunner.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'inventories' AND indexname = 'idx_inventories_search_vector'
    `);

    if (inventoryIndex.length === 0) {
      await queryRunner.query(`
        CREATE INDEX idx_inventories_search_vector 
        ON inventories USING GIN (search_vector);
      `);
    }

    // Check if search_vector column exists in items
    const itemsTable = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'items' AND column_name = 'search_vector'
    `);

    if (itemsTable.length === 0) {
      await queryRunner.query(`
        ALTER TABLE items 
        ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(custom_id, '')), 'A')
        ) STORED;
      `);
    }

    // Check if items index exists
    const itemsIndex = await queryRunner.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'items' AND indexname = 'idx_items_search_vector'
    `);

    if (itemsIndex.length === 0) {
      await queryRunner.query(`
        CREATE INDEX idx_items_search_vector 
        ON items USING GIN (search_vector);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes (safe with IF EXISTS)
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_inventories_search_vector;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_items_search_vector;`);

    // Drop columns (safe with IF EXISTS)
    await queryRunner.query(
      `ALTER TABLE inventories DROP COLUMN IF EXISTS search_vector;`,
    );
    await queryRunner.query(
      `ALTER TABLE items DROP COLUMN IF EXISTS search_vector;`,
    );
  }
}
