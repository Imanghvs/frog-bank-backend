import { Exclude } from 'class-transformer';
import { Account } from '../../accounts/entities/account.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => Account, (account: Account) => account.owner)
  accounts: Account[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
