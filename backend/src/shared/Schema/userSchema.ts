import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Roles } from '../guards/role/role.enum';

export type UserDocument = HydratedDocument<User>;
@Schema({timestamps:true})
export class User {
  _id: Types.ObjectId;
  
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  password: string;

  @Prop({ required: true })
  role: Roles;
}
export const userSchema = SchemaFactory.createForClass(User);
