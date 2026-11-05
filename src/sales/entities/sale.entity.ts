import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { SaleDetail } from './sales-detail.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('uuid', {})
  userId: string;

  @Column('uuid', {})
  clientId: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
  })
  salesTotal: number;
  @Column('date', {})
  date: Date;



  @Column('numeric', {})
  profit: number;

  @Column('text', {})
  dateUpdate: string;

  @Column('boolean', {
    default: true,
  })
  state: boolean;

  @Column('text', {
    nullable: true,
  })
  description: string;

  @ManyToOne(() => Client, (client) => client.sales)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @ManyToOne(() => User, (user) => user.sales)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => SaleDetail, (detail) => detail.sale)
  details: SaleDetail[];
}
