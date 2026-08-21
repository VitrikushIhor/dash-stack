import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength, IsArray } from 'class-validator';
import { CEFRLevel, DeckVisibility } from '../../domain/enums/vocab.enums';

export class UpdateDeckDto {
  @ApiPropertyOptional({
    description: 'Updated title of the deck',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the deck',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Language code',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'CEFR proficiency level',
    enum: CEFRLevel,
  })
  @IsEnum(CEFRLevel)
  @IsOptional()
  level?: CEFRLevel;

  @ApiPropertyOptional({
    description: 'List of tags',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Visibility level',
    enum: DeckVisibility,
  })
  @IsEnum(DeckVisibility)
  @IsOptional()
  visibility?: DeckVisibility;
}
