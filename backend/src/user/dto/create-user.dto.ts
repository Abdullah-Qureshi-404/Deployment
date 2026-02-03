import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Roles } from 'src/shared/guards/role/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'Abdullah',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Valid email address of the user',
    example: 'Abdullah@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Role assigned to the user',
    enum: Roles,
    example: Roles.Manager,
  })
  @IsEnum(Roles)
  role: Roles;
}
