import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsNumber()
  rank: number;

  @IsOptional()
  @IsNumber()
  class: number;

  @IsOptional()
  @IsNumber()
  subject: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  poster: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  rose: number;

  @IsOptional()
  @IsNumber()
  status: number;

  @IsOptional()
  @IsNumber()
  approve: number;

  @IsOptional()
  @IsString()
  teacher: string;
}
