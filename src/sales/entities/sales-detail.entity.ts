import { Product } from '../../product/entities/product.entity';
import { Sale } from './sale.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SaleDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', {})
  saleId: string;

  @Column('uuid', {})
  productId: string;

  @Column('numeric', {})
  quantity: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
  })
  total: number;

  @ManyToOne(() => Sale, (sale) => sale.details)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @ManyToOne(() => Product, (product) => product.saleDetails)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
