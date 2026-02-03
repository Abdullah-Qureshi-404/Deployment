import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, model, Types } from 'mongoose';
import { Status } from '../Enum/status.enum';

export type taskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: Object.values(Status), default: Status.TO_DO })
  status: Status;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: [String], default: [] })
  assignedTo: string[];

  @Prop({ type: [Types.ObjectId], ref: 'Comment', default: [] })
  comment: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  uploads: string[];
}

export const taskSchema = SchemaFactory.createForClass(Task);
