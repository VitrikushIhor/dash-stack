import {
  IsArray,
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status.enum';

export class BulkUpdateTasksDto {
  @ApiProperty({ example: ['task1', 'task2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids: string[];

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class BulkDeleteTasksDto {
  @ApiProperty({ example: ['task1', 'task2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids: string[];
}
