import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PasswordDto {
  @IsString()
  @IsNotEmpty()
  old_password: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string;
}
