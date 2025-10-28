import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { Item } from './item.entity';
import { Comment } from './comment.entity';
import { Access } from './access.entity';
import { ItemLike } from './item_like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  provider: 'google' | 'github';

  @Column({ name: 'provider_id', type: 'varchar', unique: true })
  providerId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // --- Relationships ---

  @OneToMany(() => ItemLike, (itemLike) => itemLike.user)
  itemLikes: ItemLike[];

  @OneToMany(() => Inventory, (inventory) => inventory.creator)
  inventories: Inventory[];

  @OneToMany(() => Item, (item) => item.creator)
  createdItems: Item[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Access, (access) => access.user, {
    // When a user is deleted, their access records should be removed.
    cascade: true,
    onDelete: 'CASCADE',
  })
  accessRecords: Access[];
}
