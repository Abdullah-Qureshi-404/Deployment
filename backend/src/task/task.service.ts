import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, taskDocument } from 'src/shared/Schema/taskSchema';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/shared/Schema/userSchema';
import { UpdateTaskDto } from '../task/dto/update-task.dto';
import { Status } from 'src/shared/Enum/status.enum';
import { Parser } from 'json2csv';
import type { Response } from 'express';
import { writeFile } from 'fs/promises';
import * as path from 'path';
@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<taskDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    try {
      const { title, description, assignedTo, startDate, endDate } =
        createTaskDto;

      if (assignedTo && assignedTo.length > 0) {
        const UserExist = await this.userModel.find({
          email: { $in: assignedTo },
        });
        if (UserExist.length !== assignedTo.length) {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Assigned users do not exist',
          };
        }
      }

      const status =
        assignedTo && assignedTo.length > 0 ? Status.IN_PROGRESS : Status.TO_DO;

      const task = await this.taskModel.create({
        title,
        description,
        createdBy: user.email,
        assignedTo: assignedTo && assignedTo.length > 0 ? assignedTo : [],
        startDate,
        endDate,
        status,
      });

      await task.save();

      return {
        code: HttpStatus.CREATED,
        message: 'Task created successfully',
        task,
      };
    } catch (error) {
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async getAllTask(page?: string, limit?: string, status?: string) {
    try {
      const filter: any = {};
      if (status) filter.status = status;

      const convertedPage = Number(page);
      const pageNum = convertedPage > 0 ? convertedPage : 1;

      const convertedLimit = Number(limit);
      const limitNum = convertedLimit > 0 ? convertedLimit : 10;
      const skip = (pageNum - 1) * limitNum;

      const tasks = await this.taskModel
        .find(filter)
        .select(
          'title description status startDate endDate createdBy assignedTo createdAt uploads comment',
        )
        .skip(skip)
        .limit(limitNum)
        .lean();

      if (!tasks || tasks.length === 0) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No tasks found',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Tasks retrieved successfully',
        tasks,
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async findTaskById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid task ID',
        };
      }

      const tasks = await this.taskModel 
        .findOne({ _id: id })
        .select(
          'title description status startDate endDate createdBy assignedTo createdAt uploads -_id',
        )
        .populate({
          path: 'comment',
          select: 'comment updatedAt repliedID -_id',
          populate: [
            { path: 'userId', select: 'username -_id' },
            {
              path: 'repliedID',
              select: 'comment userId -_id',
              populate: { path: 'userId', select: 'username -_id' },
            },
          ],
        });

      if (!tasks) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No Task Found',
        };
      }

      const formattedComments = (tasks.comment as any[]).map((c) => ({
        Username: (c.userId as any).username,
        Comment: c.comment,
        UpdatedAt: c.updatedAt,
        Uploads:c.upload,
        ...(c.repliedID && {
          RepliedTo: {
            username: c.repliedID.userId.username,
            comment: c.repliedID.comment,
          },
        }),
      }));

      return {
        code: HttpStatus.OK,
        message: 'Task retrieved successfully',
        data: {
          Title: tasks.title,
          Description: tasks.description,
          Status: tasks.status,
          StartDate: tasks.startDate,
          EndDate: tasks.endDate,
          CreatedBy: tasks.createdBy,
          AssignedTo: tasks.assignedTo,
          Comment: formattedComments,
          Upload:tasks.uploads,
        },
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

 async update(id: string, updateTaskDto: UpdateTaskDto) {
  try {
    const { assignedTo } = updateTaskDto;

    if (!Types.ObjectId.isValid(id)) {
      throw {
        code: HttpStatus.BAD_REQUEST,
        message: 'Invalid task ID',
      };
    }

    if (assignedTo) {
      const usersExist = await this.userModel.find({
        email: { $in: assignedTo },
      });
      if (usersExist.length !== assignedTo.length) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'One or more assigned user emails do not exist',
        };
      }
    }

    // update and return updated task
    const task = await this.taskModel.findByIdAndUpdate(
      id,
      { $set: updateTaskDto },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw {
        code: HttpStatus.NOT_FOUND,
        message: 'No Task Found',
      };
    }

    // status logic
    if (!task.assignedTo || task.assignedTo.length === 0) {
      task.status = Status.TO_DO;
    } else {
      task.status = Status.IN_PROGRESS;
    }
    await task.save();

    return {
      code: HttpStatus.OK,
      message: 'Task Updated Successfully',
      task,
    };
  } catch (error) {
    console.error(error);
    throw {
      code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Internal Server Error',
    };
  }
}


  async remove(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid task ID',
        };
      }

      const task = await this.taskModel.deleteOne({ _id: id });
      if (task.deletedCount === 0) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No Task Found',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Task Deleted Successfully',
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async updateStatus(status: Status, user: User, id: string) {
    try {
      const task = await this.taskModel.findOne({
        _id: id,
        assignedTo: user.email,
      });

      if (!task) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'Task not found or not assigned to you',
        };
      }

      task.status = status;
      await task.save();

      return {
        code: HttpStatus.OK,
        message: 'Task status updated successfully',
        task: {
          id: task._id,
          title: task.title,
          status: task.status,
        },
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async getAllTaskOfUser(
    user: User,
    page?: string,
    limit?: string,
    Field?: string,
    Value?: string,
  ) {
    try {
      const filter: any = {
        assignedTo: user.email,
      };
      if (Field && Value) {
        filter[Field] = Value;
      }

      const convertedPage = Number(page);
      const pageNum = convertedPage > 0 ? convertedPage : 1;

      const convertedLimit = Number(limit);
      const limitNum = convertedLimit > 0 ? convertedLimit : 10;

      const skip = (pageNum - 1) * limitNum;

      const tasks = await this.taskModel
        .find(filter)
        .skip(skip)
        .limit(limitNum)
        .lean();

      if (!tasks || tasks.length === 0) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No tasks found or not assigned to you',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Tasks retrieved successfully',
        tasks,
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async removeUserFromTask(email: string, taskId: string) {
    try {
      if (!Types.ObjectId.isValid(taskId)) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid task ID',
        };
      }

      const task = await this.taskModel.findById(taskId);
      if (!task) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'Task not found',
        };
      }

      const userExists = await this.userModel.findOne({ email });
      if (!userExists) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'User with given email does not exist',
        };
      }

      task.assignedTo = task.assignedTo.filter(
        (assignedEmail) => assignedEmail !== email,
      );

      await task.save();

      return {
        code: HttpStatus.OK,
        message: 'User removed from task successfully',
        task: {
          id: task._id,
          assignedTo: task.assignedTo,
        },
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async addUserToTask(email: string, taskId: string) {
    try {
      if (!Types.ObjectId.isValid(taskId)) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid task ID',
        };
      }

      const userExists = await this.userModel.findOne({ email: email });
      if (!userExists) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'User with given email does not exist',
        };
      }

      const task = await this.taskModel.findById(taskId);
      if (!task) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'Task not found',
        };
      }

      if (!task.assignedTo.includes(email)) {
        task.assignedTo.push(email);

        if (task.status === Status.TO_DO) {
          task.status = Status.IN_PROGRESS;
        }

        await task.save();
        return {
          code: HttpStatus.OK,
          message: 'User added to task successfully',
          task: {
            id: task._id,
            assignedTo: task.assignedTo,
            status: task.status,
          },
        };
      } else {
        return {
          code: HttpStatus.BAD_REQUEST,
          message: 'User is already assigned to this task',
          task: {
            id: task._id,
            assignedTo: task.assignedTo,
            status: task.status,
          },
        };
      }
    } catch (error) {
      console.log(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async exportTaskAsCSV(taskId: string) {
    try {
      const resp = await this.findTaskById(taskId);

      if (!resp || !resp.data) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'Task not found',
        };
      }

      const taskData = resp.data;

      const rows = (
        taskData.Comment.length > 0
          ? taskData.Comment
          : [{ Username: '', Comment: '', UpdatedAt: '' }]
      ).map((comment) => ({
        Title: taskData.Title,
        Description: taskData.Description,
        Status: taskData.Status,
        StartDate: taskData.StartDate,
        EndDate: taskData.EndDate,
        CreatedBy: taskData.CreatedBy,
        AssignedTo: Array.isArray(taskData.AssignedTo)
          ? taskData.AssignedTo.join(', ')
          : taskData.AssignedTo,
        Username: comment.Username,
        Comment: comment.Comment,
        UpdatedAt: comment.UpdatedAt,
      }));

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(rows);

      const folderPath = path.resolve(__dirname, '../../exports');

      const safeTitle = taskData.Title.replace(
        /[^a-z0-9]/gi,
        '_',
      ).toLowerCase();

      const filepath = path.join(folderPath, `${safeTitle}_${taskId}.csv`);

      await writeFile(filepath, csv);

      return {
        code: 200,
        message: 'CSV file created successfully',
        file: filepath,
      };
    } catch (error) {
      console.log(error);
      throw {
        code: error.code || 500,
        message: error.message || 'Failed to export CSV',
      };
    }
  }

  async uploadImage(taskId: string, files: Express.Multer.File[]) {
    try {
      const task = await this.taskModel.findOne({ _id: taskId });

      if (!task) {
        throw {
          code: 404,
          message: `Task with ID "${taskId}" not found`,
        };
      }

      const imageUrls = files.map((file) => `/uploads/${file.filename}`);

      task.uploads = [...(task.uploads || []), ...imageUrls];

      await task.save();

      return {
        code: 200,
        message: 'Images uploaded successfully',
        images: imageUrls,
      };
    } catch (error) {
      console.log(error);
      throw {
        code: error.code || 500,
        message: error.message || 'Failed to upload images',
      };
    }
  }
}
