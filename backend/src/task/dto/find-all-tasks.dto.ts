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

  @ApiPropertyOptional({
    description: 'Filter tasks with dueDate >= this value (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks with dueDate <= this value (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks with startDate >= this value (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks with startDate <= this value (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;
}
