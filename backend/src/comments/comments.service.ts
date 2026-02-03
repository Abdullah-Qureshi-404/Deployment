import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/shared/Schema/userSchema';
import { Model, Types } from 'mongoose';
import { Task, taskDocument } from 'src/shared/Schema/taskSchema';
import { Comment, commentDocument } from 'src/shared/Schema/commentSchema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<taskDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<commentDocument>,
  ) {}
  async create(createCommentDto: CreateCommentDto, user: User) {
    try {
      const { comment, taskId, repliedID } = createCommentDto;

      let replied = false;
      if (repliedID) {
        const msgExist = await this.commentModel.findOne({ _id: repliedID });
        if (!msgExist) {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Message does not exist or incorrect ID',
          };
        }
        replied = true;
      }

      const task = await this.taskModel.findOne({ _id: taskId });
      if (!task) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'This Task does not exist',
        };
      }

      const newComment = await this.commentModel.create({
        comment,
        replied,
        repliedID,
        userId: user._id,
        taskId: new Types.ObjectId(taskId),
      });

      task.comment.push(newComment._id);
      await task.save();

      return {
        code: HttpStatus.CREATED,
        message: 'Comment added successfully',
        comment: newComment,
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

 async findAll(page?: string, limit?: string, Field?: string, Value?: string) {
  try {
    const convertedPage = Number(page);
    const pageNum = convertedPage > 0 ? convertedPage : 1;

    const convertedLimit = Number(limit);
    const limitNum = convertedLimit > 0 ? convertedLimit : 10;

    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (Field && Value) {
      filter[Field] = Value;
    }

   const comments = await this.commentModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
        .populate('userId', '_id username')
  .populate('taskId', '_id title')
      .select('-repliedID -__v -updatedAt') 
      .lean();

    if (comments.length === 0) {
      throw {
        code: HttpStatus.NOT_FOUND,
        message: 'No comments found',
      };
    }

     const formattedData = comments.map((c) => ({
      commentId: c._id,
      userId: (c.userId as any)._id,
      username: (c.userId as any).username,
      taskId: (c.taskId as any)._id,
      taskTitle: (c.taskId as any).title,
      comment: c.comment,
      replied: c.replied,
      createdAt: (c as any).createdAt 
    }));
    return {
      code: HttpStatus.OK,
      message: 'Comments retrieved successfully',
      comments:formattedData,
    };
  } catch (error) {
    console.error(error);
    throw {
      code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Internal Server Error',
    };
  }
}


  async findOne(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid comment ID',
        };
      }

      const comment = (await this.commentModel
        .findOne({ _id: id })
         .populate('userId', '_id username')
      .populate('taskId', '_id title')
        .populate({
          path: 'repliedID',
          select: 'comment userId',
          populate: { path: 'userId', select: 'username ' },
        })
        .select('comment replied repliedID createdAt')
        .lean()) as any;

      if (!comment) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No comments found',
        };
      }

       return {
      code: HttpStatus.OK,
      message: 'Comment retrieved successfully',
      comment: {
        ...(comment.repliedID && {
          repliedTo: {
            userId: comment.repliedID.userId._id,
            username: comment.repliedID.userId.username,
            comment: comment.repliedID.comment,
          },
        }),
        userId: comment.userId._id,
        username: comment.userId.username,
        taskId: comment.taskId._id,
        taskTitle: comment.taskId.title,
        comment: comment.comment,
        createdAt: comment.createdAt
      }
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      const { comment } = updateCommentDto;

      const existingComment = await this.commentModel
        .findOne({ _id: id })
        .populate('userId', 'username -_id')
        .populate('taskId', 'title -_id')
        .select('comment');

      if (!existingComment) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No comments Found',
        };
      }

      existingComment.comment = comment;
      const savedData = await existingComment.save();

      return {
        code: HttpStatus.OK,
        message: 'Comment updated successfully',
        username: (savedData.userId as any).username,
        taskTitle: (savedData.taskId as any).title,
        comment: savedData.comment,
      };
    } catch (error) {
      console.log(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async remove(id: string) {
    try {
      const comment = await this.commentModel.findById(id);

      if (!comment) {
        return { code: 404, message: 'Comment not found' };
      }

      await this.commentModel.deleteOne({ _id: id });

      return { code: 200, message: 'Comment deleted successfully' };
    } catch (error) {
      return {
        code: error.code || 500,
        message: error.message || 'Internal Server Error',
      };
    }
  }
}
