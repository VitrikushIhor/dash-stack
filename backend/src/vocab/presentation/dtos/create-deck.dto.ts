import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { CEFRLevel, DeckVisibility } from '../../domain/enums/vocab.enums';

export class CreateDeckDto {
  @ApiProperty({
    description: 'Title of the vocabulary deck',
    minLength: 1,
    maxLength: 100,
    example: 'Oxford 3000 Essential Verbs',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional description of deck content and goals',
    maxLength: 2000,
    example: 'Collection of high-frequency English verbs for daily practice.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Language code of the deck',
    default: 'en',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'CEFR proficiency level',
    enum: CEFRLevel,
    example: CEFRLevel.A2,
  })
  @IsEnum(CEFRLevel)
  @IsOptional()
  level?: CEFRLevel;

  @ApiPropertyOptional({
    description: 'List of tags for indexing and discovery',
    type: [String],
    example: ['grammar', 'verbs'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Visibility level of the deck',
    enum: DeckVisibility,
    default: DeckVisibility.PRIVATE,
    example: DeckVisibility.PRIVATE,
  })
  @IsEnum(DeckVisibility)
  @IsOptional()
  visibility?: DeckVisibility;
}
