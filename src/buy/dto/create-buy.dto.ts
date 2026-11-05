import {
    IsNumber,
IsOptional,
IsString,
IsUUID
} from 'class-validator'
export class CreateBuyDto {
    @IsOptional()
    @IsString()
    id:string

    @IsOptional()
    @IsString()
    date:string

    @IsUUID()
    userId:string;

    @IsUUID()
    productId:string

    @IsNumber()
    cost:number
}
