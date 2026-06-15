import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsBoolean,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../enums/task-status.enum';

export function IsDueDateAfterStartDate(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isDueDateAfterStartDate',
      target: object.constructor,
      propertyName,
      options: {
        message: 'dueDate must be greater than or equal to startDate',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const dto = args.object as { startDate?: string };
          if (!dto.startDate || !value) {
            return true;
          }
          const dueDate = new Date(value as string);
          const startDate = new Date(dto.startDate);
          if (isNaN(dueDate.getTime()) || isNaN(startDate.getTime())) {
            return false;
          }
          return dueDate >= startDate;
        },
      },
    });
  };
}

export class CreateTaskLabelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color: string;
}

export class CreateChecklistItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class CreateChecklistDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Task status (PLANNED, UPCOMING, COMPLETED)',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Optional task start date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description:
      'Optional task due date (ISO 8601). Must be >= startDate when both are provided.',
  })
  @IsOptional()
  @IsDateString()
  @IsDueDateAfterStartDate()
  dueDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[]; // These are Membership IDs

  @ApiProperty({ type: CreateTaskLabelDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateTaskLabelDto)
  label: CreateTaskLabelDto;

  @ApiPropertyOptional({ type: [CreateChecklistDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistDto)
  checklists?: CreateChecklistDto[];
}
