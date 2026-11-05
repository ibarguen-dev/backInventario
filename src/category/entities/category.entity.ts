import { Product } from '../../product/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  name: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;
  @OneToMany(() => Product, (product) => product.category)
  products: Product;
}
