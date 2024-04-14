import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop()
  order: number;
  // STT: 1,2,3

  @Prop()
  title: string;

  @Prop()
  video: string;

  @Prop()
  pdf: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
