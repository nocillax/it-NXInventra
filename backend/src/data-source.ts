// src/data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/database/entities/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
});
