import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('category_lookup')
export class CategoryLookup {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;
}
