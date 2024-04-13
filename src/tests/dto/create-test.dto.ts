import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTestDto {
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsString()
  title: number;

  @IsNotEmpty()
  @IsString()
  qa: string;

  @IsNotEmpty()
  @IsString()
  lesson: string;
}
