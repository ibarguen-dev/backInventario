import { Column, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Product } from "../../product/entities/product.entity";
import { BuyDetail } from "./buy-detail.entity";
import { Supplier } from "../../supplier/entities/supplier.entity";

export class Buy {
    
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column('uuid',{})
    userId:string

      @Column('uuid', {})
        supplierId: string;

    @Column('numeric', {
        precision:10,
        scale:2
    })
    cost:number

    @Column('date', {})
    date: Date;

     @Column('text', {})
    dateUpdate: string;

     @Column('boolean', {
    default: true,
    })
    state:boolean

    @Column('text',{
        nullable:true
    })
    description:string

    @ManyToMany(() => User, (user) => user.buy)
    @JoinColumn({name:'userdId'})
    user:User

  @ManyToOne(() => Supplier, (supplier) => supplier.buy)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

   @OneToMany(() => BuyDetail, (detail) => detail.buy)
   details: BuyDetail[];
}
