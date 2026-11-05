import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Details } from '../interfaces/details.interface';

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  dateUpdate: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  clientId: string;

  @IsNumber()
  profit: number;

  @IsBoolean()
  state: boolean;

  @IsOptional()
  description: string;

  @IsNumber()
  salesTotal: number;

  @IsArray()
  details: Details[];
}
