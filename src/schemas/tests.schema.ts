import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TestDocument = HydratedDocument<Test>;

@Schema({ timestamps: true })
export class Test {
  @Prop()
  duration: number;

  @Prop()
  title: string;

  @Prop()
  qa: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' })
  lesson: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);
