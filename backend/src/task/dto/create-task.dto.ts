import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '@prisma/client';

export class CreateTaskLabelDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  color: string;
}

export class CreateChecklistItemDto {
  @ApiProperty()
  @IsString()
  title: string;
}

export class CreateChecklistDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [CreateChecklistItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
  items: CreateChecklistItemDto[];
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[]; // These are Membership IDs

  @ApiProperty({ type: [CreateTaskLabelDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskLabelDto)
  labels?: CreateTaskLabelDto[];

  @ApiProperty({ type: [CreateChecklistDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistDto)
  checklists?: CreateChecklistDto[];
}
