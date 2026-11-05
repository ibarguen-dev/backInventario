import { BuyDetail } from '../../buy/entities/buy-detail.entity';
import { Category } from '../../category/entities/category.entity';
import { SaleDetail } from '../../sales/entities/sales-detail.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  name: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
  })
  cost: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
  })
  profit: number;

  @Column('numeric', {
    nullable: false,
    default: 0,
  })
  stock: number;

  @Column('text', {
    nullable: true,
  })
  description?: string;

  @Column('boolean', {
    default: true,
  })
  state: boolean;
  @Column('uuid', {
    nullable: true,
  })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => SaleDetail, (detail) => detail.product)
  saleDetails: SaleDetail[];

  @OneToMany(() => BuyDetail, (detail) => detail.product)
  buyDetails: BuyDetail[];
}
