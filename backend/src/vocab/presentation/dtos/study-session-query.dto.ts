import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

function parseBooleanQuery({ obj, key }: { obj: unknown; key: string }): unknown {
  if (typeof obj !== 'object' || obj === null) return undefined;
  const value: unknown = Reflect.get(obj, key);
  if (value === 'true' || value === '1' || value === true) return true;
  if (value === 'false' || value === '0' || value === false) return false;
  return value;
}

export class StudySessionQueryDto {
  @ApiPropertyOptional({
    description: 'Study mode to prepare session for',
    enum: ['flashcards', 'learn', 'test', 'match'],
    default: 'flashcards',
  })
  @IsOptional()
  @IsIn(['flashcards', 'learn', 'test', 'match'])
  mode?: 'flashcards' | 'learn' | 'test' | 'match';

  @ApiPropertyOptional({
    description: 'Filter to only include starred cards in the study session',
    default: false,
  })
  @IsOptional()
  @Transform(parseBooleanQuery)
  @IsBoolean()
  onlyStarred?: boolean;

  @ApiPropertyOptional({
    description: 'Filter to existing progress with nextReviewAt at or before the current time',
    default: false,
  })
  @IsOptional()
  @Transform(parseBooleanQuery)
  @IsBoolean()
  onlyDue?: boolean;
}
