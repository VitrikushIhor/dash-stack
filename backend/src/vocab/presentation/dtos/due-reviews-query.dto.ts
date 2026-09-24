import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DueReviewsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter due reviews count to a specific deck',
    example: 'clz123deck456',
  })
  @IsOptional()
  @IsString()
  deckId?: string;
}
