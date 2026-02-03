import { SetMetadata } from '@nestjs/common';
import { Roles } from './role.enum';

export const Role = (...roles: Roles[]) => SetMetadata('roles', roles);
