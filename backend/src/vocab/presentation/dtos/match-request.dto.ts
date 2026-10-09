import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  ValidateNested,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';
import { MatchTileSide } from '../../application/commands/match-session.command';

const MATCH_TILE_SIDES = Object.values(MatchTileSide);

export class MatchTileDto {
  @IsString()
  cardId: string;

  @IsIn(MATCH_TILE_SIDES)
  side: MatchTileSide;
}

export class RecordMatchPairDto {
  @ValidateIf((object: RecordMatchPairDto) => object.attemptId === undefined)
  @IsString()
  cardId?: string;

  @ValidateIf((object: RecordMatchPairDto) => object.cardId === undefined)
  @IsUUID()
  attemptId?: string;

  @ValidateIf((object: RecordMatchPairDto) => object.cardId === undefined)
  @ValidateNested()
  @Type(() => MatchTileDto)
  first?: MatchTileDto;

  @ValidateIf((object: RecordMatchPairDto) => object.cardId === undefined)
  @ValidateNested()
  @Type(() => MatchTileDto)
  second?: MatchTileDto;
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
