import { IsOptional, IsUUID, MinLength } from "class-validator";

export class CreateSupplierDto {
    @IsUUID()
    @IsOptional()
    id:string

    @MinLength(3)
    name:string
}
