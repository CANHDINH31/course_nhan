import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRateDto {
  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  vote: number;
}
