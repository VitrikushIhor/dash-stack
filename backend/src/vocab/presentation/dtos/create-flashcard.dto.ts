import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class FlashcardItemDto {
  @ApiProperty({
    description: 'Term / word to learn',
    maxLength: 255,
    example: 'algorithm',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  term: string;

  @ApiProperty({
    description: 'Definition or translation of the term',
    maxLength: 1000,
    example:
      'A process or set of rules to be followed in calculations or problem-solving operations.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  definition: string;

  @ApiPropertyOptional({
    description: 'Example sentence illustrating term usage in context',
    maxLength: 500,
    example: 'The search algorithm provides results in milliseconds.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  example?: string;

  @ApiPropertyOptional({
    description: 'Illustrative image URL',
    example: 'https://images.unsplash.com/photo-1526374965328',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateFlashcardsDto {
  @ApiProperty({
    description: 'Array of flashcard items to create (1 to 100 items per request)',
    type: [FlashcardItemDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => FlashcardItemDto)
  cards: FlashcardItemDto[];
}
