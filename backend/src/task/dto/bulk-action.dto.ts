import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTaskDto } from './update-task.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateTasksDto {
  @ApiProperty({ example: ['task1', 'task2'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids: string[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateTaskDto)
  data: UpdateTaskDto;
}

export class BulkDeleteTasksDto {
  @ApiProperty({ example: ['task1', 'task2'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids: string[];
}
