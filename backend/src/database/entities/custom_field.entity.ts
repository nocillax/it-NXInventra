import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { ItemFieldValue } from './item_field_value.entity';

export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'link';

@Entity('custom_fields')
@Index(['inventoryId', 'orderIndex'])
export class CustomField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  type: CustomFieldType;

  @Column({ name: 'show_in_table', type: 'boolean', default: false })
  showInTable: boolean;

  @Column({ name: 'order_index', type: 'smallint', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Inventory, (inventory) => inventory.customFields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @OneToMany(() => ItemFieldValue, (value) => value.field, {
    cascade: true,
  })
  values: ItemFieldValue[];
}
