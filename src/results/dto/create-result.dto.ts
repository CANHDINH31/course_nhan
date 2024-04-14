import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResultDto {
  @IsNotEmpty()
  @IsString()
  student: string;

  @IsNotEmpty()
  @IsString()
  test: string;

  @IsNotEmpty()
  @IsString()
  answer: string;
}
