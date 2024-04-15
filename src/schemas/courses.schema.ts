import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop()
  rank: number;
  // 1. Tiểu học 2:THCS 3:THPT 4:ĐẠI HỌC

  @Prop()
  class: number;
  // 1:1 2:2 3:3 ..... 13:Năm nhất 14:Năm hai ...

  @Prop()
  subject: number;
  // 1.Toán 2.Tiếng Việt 3... Tùy do FE truyền lên và setup

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  poster: string;

  @Prop()
  price: number;

  @Prop()
  rose: number;

  @Prop({ default: 1 })
  status: number;
  // 1: enable 0: disable

  @Prop({ default: 3 })
  approve: number;
  // 1: approve 0:reject 2:pending 3:notsubmit

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  teacher: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
