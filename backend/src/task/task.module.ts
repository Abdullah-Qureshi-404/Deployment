import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from 'src/shared/Schema/taskSchema';
import { User, userSchema } from 'src/shared/Schema/userSchema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: taskSchema }]),
      MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports:[MongooseModule],
})
export class TaskModule {}
