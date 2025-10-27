import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Item } from './item.entity';
import { Comment } from './comment.entity';
import { Access } from './access.entity';

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

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  public: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'id_format', type: 'jsonb', nullable: true })
  idFormat: object[];

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: object[];

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
}
