import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type commentDocument = HydratedDocument<Comment>;
@Schema({ timestamps: true })
export class Comment {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId = Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task', required: true })
  taskId = Types.ObjectId;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  repliedID?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  replied: boolean;
}
export const commentSchema = SchemaFactory.createForClass(Comment);
