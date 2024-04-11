import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TestDocument = HydratedDocument<Test>;

@Schema({ timestamps: true })
export class Test {
  @Prop()
  duration: number;

  @Prop()
  title: string;

  @Prop()
  content: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);
