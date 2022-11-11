import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  BOY = 'boy',
  GIRL = 'girl',
}

export enum AccountLVL {
  PRIME = 'prime',
  GUEST = 'guest',
}

@Entity('accounts')
export default class AccountEntity extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ nullable: true })
  fullName: string;

  @ApiProperty()
  @Column({ enum: Gender, nullable: true })
  gender: Gender;

  @ApiProperty()
  @Column({ nullable: true })
  country: string;

  @ApiProperty()
  @Column({ nullable: true })
  telegramUserId: number;

  @ApiProperty()
  @Column({ enum: AccountLVL, nullable: true, default: AccountLVL.GUEST })
  accountLVL: AccountLVL;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  readonly createdAt: Date = new Date();

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  readonly updatedAt: Date = new Date();
}
