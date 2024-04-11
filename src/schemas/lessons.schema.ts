import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop()
  title: string;

  @Prop()
  video: string;

  @Prop()
  pdf: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Test' })
  test: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
