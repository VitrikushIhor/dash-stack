import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFlashcardDto {
  @ApiPropertyOptional({
    description: 'Updated term',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  term?: string;

  @ApiPropertyOptional({
    description: 'Updated definition',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  definition?: string;

  @ApiPropertyOptional({
    description: 'Updated example sentence',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  example?: string;

  @ApiPropertyOptional({
    description: 'Updated image URL',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
