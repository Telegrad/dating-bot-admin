import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  COMPLETE = 'complete',
  NEW = 'new',
}

@Entity('orders')
export default class OrderEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  orderID: string;

  @Column({ nullable: false })
  accountID: number;

  @Column({ enum: OrderStatus, nullable: false, default: OrderStatus.NEW })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  readonly createdAt: Date = new Date();

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  readonly updatedAt: Date = new Date();
}
