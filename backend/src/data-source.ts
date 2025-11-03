// src/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    'src/database/entities/*.entity.ts',
    // or if you prefer the compiled path:
    // 'dist/database/entities/*.entity.js'
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
