import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The comment text',
    example: 'This is a comment.',
  })
  @IsString()
  comment: string;

  @ApiProperty({
    description: 'The ID of the task this comment belongs to',
    example: '64d1b2c3f8a9c2b8e7d3f456',
  })
  @IsString()
  taskId: string;

  @ApiProperty({
    description: 'The ID of the msg whom you are replying',
    example: '64d1b2c3f8a9c2b8e7d3f456',
  })
  @IsString()
  @IsOptional()
  repliedID?: string;

}
