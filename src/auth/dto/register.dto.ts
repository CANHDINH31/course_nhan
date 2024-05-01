import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(8)
  password: string;

  @IsNumber()
  @IsNotEmpty()
  role: number;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  description: string;

  @ValidateIf((object, value) => object.role === 3)
  @IsNotEmpty()
  @IsString()
  certificate: string;
}
