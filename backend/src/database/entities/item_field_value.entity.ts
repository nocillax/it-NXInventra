import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { CustomField } from './custom_field.entity';

@Entity('item_field_values')
@Index(['itemId', 'fieldId'], { unique: true })
export class ItemFieldValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @Column({ name: 'field_id', type: 'int' })
  fieldId: number;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string;

  @Column({ name: 'value_number', type: 'double precision', nullable: true })
  valueNumber: number;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Item, (item) => item.fieldValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => CustomField, (field) => field.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'field_id' })
  field: CustomField;
}
