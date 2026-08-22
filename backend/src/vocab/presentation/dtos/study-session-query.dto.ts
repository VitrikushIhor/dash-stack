import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

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
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  onlyStarred?: boolean;

  @ApiPropertyOptional({
    description: 'Filter to only include cards due for SRS review or unstudied (NEW)',
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  onlyDue?: boolean;
}
