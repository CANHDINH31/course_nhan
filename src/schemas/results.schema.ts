import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ResultDocument = HydratedDocument<Result>;

@Schema({ timestamps: true })
export class Result {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  parent: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  student: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Test' })
  test: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' })
  lesson: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: string;

  @Prop()
  answer: string;

  @Prop()
  order: number;

  @Prop()
  totalQuestion: number;

  @Prop()
  totalCorrect: number;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
