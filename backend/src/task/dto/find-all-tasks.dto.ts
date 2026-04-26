import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FindAllTasksDto {
  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TaskStatus, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  status?: TaskStatus[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Filter by assignee IDs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  assigneeIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Filter by label names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  labelNames?: string[];

  @ApiPropertyOptional({ description: 'Filter by deadline from date' })
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by deadline to date' })
  @IsOptional()
  @IsDateString()
  deadlineTo?: string;
}
