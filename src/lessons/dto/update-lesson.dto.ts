import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  video: string;

  @IsOptional()
  @IsString()
  pdf: string;

  @IsOptional()
  @IsString()
  course: string;
}
