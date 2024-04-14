import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RateDocument = HydratedDocument<Rate>;

@Schema({ timestamps: true })
export class Rate {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string;

  @Prop()
  content: string;

  @Prop()
  vote: number;
}

export const RateSchema = SchemaFactory.createForClass(Rate);
