import { IsNotEmpty, IsString } from 'class-validator';

export class LastOrderDto {
  @IsNotEmpty()
  @IsString()
  student: string;

  @IsNotEmpty()
  @IsString()
  course: string;
}
