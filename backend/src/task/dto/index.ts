import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {  IsNotEmpty,IsMongoId, IsOptional } from 'class-validator';

export class UploadImagesDto {
    @ApiProperty({
        description:'TaskId',
        example:'UUID',
        required:true
    })
    @IsMongoId({message:'Must be a valid mongoId'})
    @IsNotEmpty()
    taskId:string;

    @ApiPropertyOptional({
        description: 'Profile picture file',
        type: 'array',
        items: {
          type:'string',
          format:'binary'
        },
        required: false
    })
    @IsOptional()
    files?: Express.Multer.File[]
}
