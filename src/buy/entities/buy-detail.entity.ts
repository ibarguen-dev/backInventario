import { Column, JoinColumn, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../product/entities/product.entity";
import { Buy } from "./buy.entity";

export class BuyDetail {
    
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column('uuid',{})
    buyId:string

    @Column('uuid',{})
    productId:string

    @Column('numeric', {})
    quantity:number

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


    @ManyToMany(() => Buy, (buy) => buy.details)
    @JoinColumn({name:'buyId'})
    buy:Buy

    @ManyToMany(()=> Product,(product)=> product)
    @JoinColumn({name:'productId'})
    product:Product
}
