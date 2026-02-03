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
  HttpStatus,
  Res,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetUser } from 'src/shared/Decorator/getUser.decorator';
import { User } from 'src/shared/Schema/userSchema';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RoleGuard } from 'src/shared/guards/role/role.guard';
import { Roles } from 'src/shared/guards/role/role.enum';
import { Role } from 'src/shared/guards/role/role.decorator';
import type { Response } from 'express';

@ApiTags('Comments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, RoleGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Role(Roles.DEVELOPER, Roles.Manager, Roles.QA)
  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async writeComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const data = await this.commentsService.create(createCommentDto, user);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Comment:data.comment,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.DEVELOPER, Roles.Manager, Roles.QA)
  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({
    status: 200,
    description: 'List of comments returned successfully.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'Field', required: false })
  @ApiQuery({ name: 'Value', required: false })
  async findAllTask(
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('Field') Field?: string,
    @Query('Value') Value?: string,
  ) {
    try {
      const data = await this.commentsService.findAll(
        page,
        limit,
        Field,
        Value,
      );
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Comment:data.comments,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.DEVELOPER, Roles.Manager, Roles.QA)
  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the comment to find',
  })
  @ApiResponse({ status: 200, description: 'Comment returned successfully.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  async findCommentById(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.commentsService.findOne(id);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Comments:data.comment,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Role(Roles.DEVELOPER, Roles.Manager, Roles.QA)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the comment to update',
  })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.commentsService.update(id, updateCommentDto);
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

  @Role(Roles.DEVELOPER, Roles.Manager, Roles.QA)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the comment to delete',
  })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  async deleteTask(@Param('id') id: string, @Res() res: Response) {
    try {
      const data = await this.commentsService.remove(id);
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
