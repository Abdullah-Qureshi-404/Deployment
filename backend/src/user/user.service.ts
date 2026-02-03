import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/shared/Schema/userSchema';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Roles } from 'src/shared/guards/role/role.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private jwt: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { username, email, password, role } = createUserDto;

      const userExist = await this.userModel.findOne({ email });
      if (userExist) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'User already exists',
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new this.userModel({
        username,
        email,
        password: hashedPassword,
        role,
      });

      await user.save();

      const token = this.jwt.sign({ email, id: user._id });
      if (!token) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'Token could not be generated',
        };
      }
      return {
        code: HttpStatus.CREATED,
        message: 'User signup successfully',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role,
          token,
        },
      };
    } catch (error) {
      console.log(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Cannot find user with this email',
        };
      }

      const matchedPassword = bcrypt.compareSync(password, user.password);
      if (!matchedPassword) {
        throw {
          code: HttpStatus.UNAUTHORIZED,
          message: 'Incorrect password',
        };
      }

      const token = this.jwt.sign({ email, id: user._id });
      if (!token) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'Token could not be generated',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Login successful',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token,
        },
      };
    } catch (error) {
      console.log(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal Server Error',
      };
    }
  }

  async getAllUsers(page?: string, limit?: string, role?: string) {
    try {
      const filter: any = {};

      if (role) {
        if (!Object.values(Roles).includes(role as Roles)) {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Invalid role filter',
          };
        }
        filter.role = role;
      }

      const convertedPage = Number(page);
      const pageNum = convertedPage > 0 ? convertedPage : 1;

      const convertedLimit = Number(limit);
      const limitNum = convertedLimit > 0 ? convertedLimit : 10;

      const skip = (pageNum - 1) * limitNum;

      const users = await this.userModel
        .find(filter)
        .select('username email role ')
        .skip(skip)
        .limit(limitNum);

      if (!users || users.length === 0) {
        throw {
          code: HttpStatus.NOT_FOUND,
          message: 'No users found',
        };
      }

      return {
        code: HttpStatus.OK,
        message: 'Users fetched successfully',
        users,
      };
    } catch (error) {
      console.error(error);
      throw {
        code: error.code || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch users',
      };
    }
  }
}
