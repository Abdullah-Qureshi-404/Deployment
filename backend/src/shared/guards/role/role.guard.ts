import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if(!roles || roles.length===0){
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const result = roles.includes(user.role);

    return result;
  }
}
