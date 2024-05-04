import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  replyComment: string;

  @IsOptional()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  lesson: string;
}
