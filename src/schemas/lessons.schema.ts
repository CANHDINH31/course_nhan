import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop()
  order: number;
  // STT: 1,2,3

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  video: string;

  @Prop()
  pdf: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// const qa = [{
//   "question":"viet o chau nao ?",
//   "answer":["chau a", "chau au", "chau phi","chau mi"],
//   "answer correct":0
// },{},{}]
