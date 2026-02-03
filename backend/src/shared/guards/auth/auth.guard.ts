import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { User, UserDocument } from 'src/shared/Schema/userSchema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    @InjectModel(User.name) private readonly userRepo: Model<UserDocument>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const autHeader = req.headers['authorization'];

      if (!autHeader || !autHeader.startsWith('Bearer ')) {
        throw new HttpException(
          { error: 'Issue in Auth Header' },
          HttpStatus.NOT_FOUND,
        );
      }
      const token = autHeader.split(' ')[1];
      const payload = this.jwt.verify(token, {
        secret: process.env.SECRET_KEY,
      });

      const user = await this.userRepo.findOne({ email: payload.email });
      if (!user) {
        throw new HttpException(
          { error: 'User not Found' },
          HttpStatus.NOT_FOUND,
        );
      }
      req.user = user;
      return true;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
