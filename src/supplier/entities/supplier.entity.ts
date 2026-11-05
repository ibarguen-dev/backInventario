import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Buy } from "../../buy/entities/buy.entity";

export class Supplier {

    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column('text',{})
    name:string

    @OneToMany(() => Buy,(buy)=>buy.supplier)
    buy:Buy[]
}
