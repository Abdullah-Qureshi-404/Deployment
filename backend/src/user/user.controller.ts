import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RoleGuard } from 'src/shared/guards/role/role.guard';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { Role } from 'src/shared/guards/role/role.decorator';
import { Roles } from 'src/shared/guards/role/role.enum';
import type { Response } from 'express';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      let data = await this.userService.create(createUserDto);
      res.status(data.code).json({
        code:data.code,
        message:data.message,
        data:data.data
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token.',
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      let data = await this.userService.login(loginDto);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Data:data.data,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  @Role(Roles.Manager)
  @ApiOperation({ summary: 'Get all users (Manager only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number (optional)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Number of items per page (optional)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    description: 'Filter by role (optional)',
  })
  async getAllUsers(
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
  ) {
    try {
      let data = await this.userService.getAllUsers(page, limit, role);
      res.status(data.code).json({
        code: data.code,
        message: data.message,
        Data:data.users,
      });
    } catch (error) {
      res.status(error.code || HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      });
    }
  }
}
