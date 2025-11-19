import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';
import { Comment } from './comment.entity';
import { Access, AccessRole } from './access.entity';
import { CustomField } from './custom_field.entity';
import { Tag } from './tag.entity';

export interface IdSegment {
  id: string;
  type:
    | 'fixed'
    | 'date'
    | 'sequence'
    | 'random_20bit'
    | 'random_32bit'
    | 'random_6digit'
    | 'random_9digit'
    | 'guid';
  value?: string;
  format?: string;
}

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'boolean', default: true })
  public: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'id_format', type: 'jsonb', nullable: true })
  idFormat: IdSegment[];

  @Column({
    name: 'api_token',
    type: 'varchar',
    length: 64,
    nullable: true,
    unique: true,
  })
  apiToken: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User, (user) => user.inventories)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Item, (item) => item.inventory, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: Item[];

  @OneToMany(() => Comment, (comment) => comment.inventory, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => Access, (access) => access.inventory, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  accessRecords: Access[];

  @OneToMany(() => CustomField, (field) => field.inventory, {
    cascade: true,
    eager: true, // Automatically load custom fields when an inventory is loaded
  })
  customFields: CustomField[];

  @ManyToMany(() => Tag, (tag) => tag.inventories)
  @JoinTable({
    name: 'inventory_tags',
    joinColumn: { name: 'inventory_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }, // Changed from tag_name to tag_id
  })
  tags: Tag[];
}
