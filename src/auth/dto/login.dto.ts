import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  user: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
