import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubDocument = HydratedDocument<Sub>;

@Schema({ timestamps: true })
export class Sub {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  parent: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  student: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  course: string;

  @Prop()
  feeTeacher: number;

  @Prop()
  feeAdmin: number;
}

export const SubSchema = SchemaFactory.createForClass(Sub);
