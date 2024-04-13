import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  _id: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsArray()
  @IsOptional()
  children: string[];

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  enable?: number;
}
