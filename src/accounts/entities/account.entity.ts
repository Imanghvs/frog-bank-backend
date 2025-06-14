import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  accountNumber: string;

  @Column('decimal', { scale: 2 })
  balance: number;

  @ManyToOne(() => User, (user: User) => user.accounts, { eager: true })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
}
