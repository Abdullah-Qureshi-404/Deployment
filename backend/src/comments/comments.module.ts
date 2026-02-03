import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Task, taskSchema } from 'src/shared/Schema/taskSchema';
import { Comment, commentSchema } from 'src/shared/Schema/commentSchema';
import { User, userSchema } from 'src/shared/Schema/userSchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: taskSchema },
      { name: Comment.name, schema: commentSchema },
      { name: User.name, schema: userSchema }
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
