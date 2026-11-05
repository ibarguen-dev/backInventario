import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClientDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @MinLength(3)
  name: string;

  @IsOptional()
  @MinLength(3)
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @MinLength(3)
  address: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
