import { Sale } from '../../sales/entities/sale.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', {
    unique: true,
  })
  name: string;

  @Column('text', {
    unique: true,
  })
  phone: string;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  email: string;

  @Column('text', {
    nullable: true,
  })
  address?: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Sale, (sale) => sale.client)
  sales: Sale[];
}
