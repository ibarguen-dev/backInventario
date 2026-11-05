import { Sale } from '../../sales/entities/sale.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Buy } from '../../buy/entities/buy.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', {
    unique: true,
    nullable: false,
  })
  user: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  name: string;
  @Column('text', {
    unique: true,
    nullable: true,
  })
  email: string;

  @Column('text', {
    nullable: false,
    select: false,
  })
  password: string;
  @Column('boolean', {
    default: true,
  })
  isActive: boolean;
  @Column('boolean', {
    nullable: false,
    default: true,
  })
  mustChangePassword: boolean;

  @Column('boolean', {
    default: false,
  })
  temporaryPassword: boolean;

  @Column('timestamp', {
    nullable: true,
  })
  passwordChangedAt: Date;

  @Column('text', { nullable: true })
  rolId: string;

  @OneToMany(() => Sale, (sale) => sale.user)
  sales: Sale[];

  @OneToMany(() => Buy, (buy) => buy.user)
  buy: Buy[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'rolId' })
  rol: Role;
}
