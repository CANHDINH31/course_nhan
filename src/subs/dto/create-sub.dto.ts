import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubDto {
  @IsOptional()
  @IsString()
  parent: string;

  @IsNotEmpty()
  @IsString()
  student: string;

  @IsNotEmpty()
  @IsString()
  course: string;
}
