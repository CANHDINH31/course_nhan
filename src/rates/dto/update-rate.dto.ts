import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRateDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
