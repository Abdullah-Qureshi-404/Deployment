import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, ArrayNotEmpty, ArrayUnique, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Design Homepage',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Create the wireframe and UI for the homepage',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

 @ApiProperty({
    description: 'Emails of users to whom the task is assigned',
    example: ['user1@example.com', 'user2@example.com'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEmail({}, { each: true })
  assignedTo?: string[];

  @ApiProperty({
    description: 'Start date of the task',
    example: '2025-08-12T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'End date of the task',
    example: '2025-08-20T18:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
