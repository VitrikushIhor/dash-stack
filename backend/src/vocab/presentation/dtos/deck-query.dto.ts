import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DeckStatus } from '../../domain/enums/vocab.enums';
import { PaginationDto } from '../../../common/pagination/pagination.dto';

export class MyDecksQueryDto {
  @ApiPropertyOptional({
    description: 'Filter decks by status',
    enum: DeckStatus,
  })
  @IsEnum(DeckStatus)
  @IsOptional()
  status?: DeckStatus;
}

export class PublicDecksQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query across title, description, and tags',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by CEFR level',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated tags to filter by',
  })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Alias for perPage (max: 100)',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
