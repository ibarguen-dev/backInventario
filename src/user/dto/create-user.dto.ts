import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  user: string;

  @IsEmail()
  email: string;

  @IsUUID('4')
  @IsOptional()
  rolId: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsBoolean()
  @IsOptional()
  recovery: boolean;
}
