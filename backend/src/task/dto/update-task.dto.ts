import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Title of the task',
    example: 'Design Homepage',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example: 'Create the wireframe and UI for the homepage',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Emails of users to whom the task is assigned',
    example: ['user1@example.com', 'user2@example.com'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  assignedTo?: string[];

  @ApiPropertyOptional({
    description: 'Start date of the task',
    example: '2025-08-25T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date of the task',
    example: '2025-08-30T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
