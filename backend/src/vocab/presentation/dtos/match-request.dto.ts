import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';

export class RecordMatchPairDto {
  @IsString()
  cardId: string;
}

export class CreateMatchSessionDto {
  @ApiPropertyOptional()
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsBoolean()
  onlyDue?: boolean;
  @ApiPropertyOptional()
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsBoolean()
  onlyStarred?: boolean;
}

export class MatchLeaderboardQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage = 10;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function parseMatchRequestBody(body: unknown): Record<string, unknown> {
  if (body === undefined) return {};
  if (isPlainObject(body)) return body;
  throw new BadRequestException('Match body must be a JSON object.');
}

export function parseCreateMatchBody(body: unknown): CreateMatchSessionDto {
  const dto = plainToInstance(CreateMatchSessionDto, parseMatchRequestBody(body));
  if (validateSync(dto, { whitelist: true, forbidNonWhitelisted: true }).length > 0) {
    throw new BadRequestException('Only boolean onlyDue and onlyStarred filters are accepted');
  }
  return dto;
}

export function validateMatchCompletionBody(body: unknown): void {
  if (Object.keys(parseMatchRequestBody(body)).length > 0)
    throw new BadRequestException('Match completion accepts no body fields');
}
