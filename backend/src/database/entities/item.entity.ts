import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
  VersionColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { User } from './user.entity';
import { ItemFieldValue } from './item_field_value.entity';

@Entity('items')
@Index(['inventoryId', 'customId'], { unique: true })
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'custom_id', type: 'varchar', length: 50 })
  customId: string;

  @Column({ name: 'sequence_number', type: 'integer', nullable: true })
  sequenceNumber: number;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @Column({ type: 'integer', default: 0 })
  likes: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  // --- Relationships ---

  @ManyToOne(() => Inventory, (inventory) => inventory.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => User, (user) => user.createdItems, {
    // We set to null on user deletion to keep the item record,
    // as the item belongs to the inventory, not the user.
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ItemFieldValue, (fieldValue) => fieldValue.item, {
    cascade: true,
  })
  fieldValues: ItemFieldValue[];
}
