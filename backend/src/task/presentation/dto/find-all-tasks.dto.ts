import { IsOptional, IsString, IsEnum, IsArray, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TaskStatus } from '../../domain/enums/task-status.enum';

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
  @Type(() => Date)
  @IsDate()
  dueDateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter tasks with dueDate <= this value (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDateTo?: Date;

  @ApiPropertyOptional({
    description: 'Filter tasks with startDate >= this value (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter tasks with startDate <= this value (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateTo?: Date;
}
