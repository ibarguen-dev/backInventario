import { Product } from '../../product/entities/product.entity';

export interface Details {
  id?: string;
  productId: string;
  quantity: number;
  quantityOld?: number;
  price: number;
  total: number;
}
export interface SearchDetails {
  id?: string;
  productId: string;
  quantity: number;
  quantityOld?: number;
  price: number;
  total: number;
  product: Product;
}
