import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTestDto {
  @IsOptional()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  title: number;

  @IsOptional()
  @IsString()
  qa: string;

  @IsOptional()
  @IsString()
  lesson: string;
}
