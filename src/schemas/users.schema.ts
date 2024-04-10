import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  // 1:student  2:parent  3:teacher  4:admin
  @Prop({ default: 1 })
  role: number;

  @Prop()
  certificate: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  children: string[];

  @Prop({ default: 1 })
  status: number;
  // 1:active 0:inactive

  @Prop({ default: 1 })
  isDelete: number;
  // 1:exist 0:not exist
}

export const UserSchema = SchemaFactory.createForClass(User);
