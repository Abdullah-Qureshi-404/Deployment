import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetUser } from 'src/shared/Decorator/getUser.decorator';
import { User } from 'src/shared/Schema/userSchema';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RoleGuard } from 'src/shared/guards/role/role.guard';
import { Role } from 'src/shared/guards/role/role.decorator';
import { Roles } from 'src/shared/guards/role/role.enum';
import { Status } from 'src/shared/Enum/status.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Storage } from 'src/shared/imageUpload/imageUpload.services';
import type { Response } from 'express';
import { UploadImagesDto } from './dto';
import { log } from 'console';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RoleGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Role(Roles.Manager)
  @Post()
  @ApiOperation({ summary: 'Create a new task (Manager only)' })
  @ApiResponse({ status: 201, description: 'Task successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      let data = await this.taskService.create(createTaskDto, user);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Task:data.task
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.Manager)
  @Get()
  @ApiOperation({ summary: 'Get all tasks (Manager only)' })
  @ApiResponse({ status: 200, description: 'List of all tasks.' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAllTask(
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    try {
      const data = await this.taskService.getAllTask(page, limit, status);
      // console.log("data: " ,data)
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Task:data.tasks,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.Manager, Roles.DEVELOPER, Roles.QA)
  @Get('id/:id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the task' })
  @ApiResponse({ status: 200, description: 'Task found.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async findTaskById(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.taskService.findTaskById(id);
       console.log("Raw data from service:", data); // step 2
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Task:data.data,
      });
    } catch (error) {
       console.error("Error caught in controller:", error);
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.DEVELOPER, Roles.QA)
  @Get('/user')
  @ApiOperation({
    summary:
      'Get all tasks assigned to the logged-in user (Developer or QA only)',
  })
  @ApiResponse({ status: 200, description: 'List of user tasks.' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'Field', required: false })
  @ApiQuery({ name: 'Value', required: false })
  async getAllTaskOfUser(
    @Res() res: Response,
    @GetUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('Field') Field?: string,
    @Query('Value') Value?: string,
  ) {
    try {
      const data = await this.taskService.getAllTaskOfUser(
        user,
        page,
        limit,
        Field,
        Value,
      );
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Task:data.tasks,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.Manager)
  @Patch(':id')
  @ApiOperation({ summary: 'Update task by ID (Manager only)' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the task to update',
  })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async updateTaskById(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.taskService.update(id, updateTaskDto);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Task:data.task,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.Manager)
  @Patch('removeUser/:taskId')
  @ApiOperation({
    summary: 'Remove a user from assigned users of a task (Manager only)',
  })
  @ApiParam({ name: 'taskId', required: true, description: 'ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'User removed from task successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid taskId or userEmail.' })
  @ApiResponse({ status: 404, description: 'Task or User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email of the user to remove',
        },
      },
      required: ['email'],
    },
  })
  async removeUserFromTask(
    @Param('taskId') taskId: string,
    @Body('email') email: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.taskService.removeUserFromTask(email, taskId);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.Manager)
  @Patch('addUser/:taskId')
  @ApiOperation({ summary: 'Add user to a task (Manager only)' })
  @ApiParam({ name: 'taskId', required: true, description: 'ID of the task' })
  @ApiResponse({ status: 200, description: 'User added successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid taskId or userEmail.' })
  @ApiResponse({ status: 404, description: 'Task or User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email of the user to add' },
      },
      required: ['email'],
    },
  })
  async addUserToTask(
    @Param('taskId') taskId: string,
    @Body('email') email: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.taskService.addUserToTask(email, taskId);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.DEVELOPER, Roles.QA)
  @Patch('/update/:id')
  @ApiOperation({ summary: 'Update status of own task (Developer or QA only)' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the task' })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this task.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Manager/Developer/QA' },
      },
    },
  })
  async updateTaskStatus(
    @Body('status') status: Status,
    @GetUser() user: User,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.taskService.updateStatus(status, user, id);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.Manager)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by ID (Manager only)' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the task to delete',
  })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async DeleteTaskById(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.taskService.remove(id);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  

  @Get('export-csv/:id')
  @ApiOperation({ summary: 'Export task as CSV file' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the task' })
  @ApiResponse({ status: 200, description: 'CSV file of task' })
  async exportTaskCSV(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.taskService.exportTaskAsCSV(id);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10, { storage: Storage }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images for a task' })
  @ApiResponse({ status: 200, description: 'Images uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async uploadImages(
    @Body() body:UploadImagesDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    try {
      const data = await this.taskService.uploadImage(body.taskId, files);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }
}
