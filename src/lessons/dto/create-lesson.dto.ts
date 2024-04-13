import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  video: string;

  @IsNotEmpty()
  @IsString()
  pdf: string;

  @IsNotEmpty()
  @IsString()
  course: string;
}
