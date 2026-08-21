import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FlashcardResponseDto } from './flashcard-response.dto';
import { CEFRLevel, DeckStatus, DeckType, DeckVisibility } from '../../domain/enums/vocab.enums';

export class DeckResponseDto {
  @ApiProperty({ example: 'deck_12345' })
  id: string;

  @ApiProperty({ example: 'user_12345' })
  ownerUserId: string;

  @ApiProperty({ example: 'Essential Spanish Verbs' })
  title: string;

  @ApiPropertyOptional({ example: 'essential-spanish-verbs' })
  slug?: string | null;

  @ApiPropertyOptional({ example: 'Top 100 most common Spanish verbs' })
  description?: string | null;

  @ApiProperty({ example: 'es' })
  language: string;

  @ApiPropertyOptional({
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    example: 'A1',
  })
  level?: CEFRLevel | null;

  @ApiProperty({ example: ['spanish', 'verbs', 'beginner'], type: [String] })
  tags: string[];

  @ApiProperty({
    enum: ['PRIVATE', 'UNLISTED', 'PUBLIC'],
    example: 'PUBLIC',
  })
  visibility: DeckVisibility;

  @ApiProperty({
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    example: 'PUBLISHED',
  })
  status: DeckStatus;

  @ApiProperty({
    enum: ['SYSTEM', 'USER_GENERATED'],
    example: 'USER_GENERATED',
  })
  type: DeckType;

  @ApiPropertyOptional({ example: 'deck_orig_123' })
  forkedFromDeckId?: string | null;

  @ApiProperty({ example: 25 })
  cardCount: number;

  @ApiPropertyOptional({ type: [FlashcardResponseDto] })
  flashcards?: FlashcardResponseDto[];

  @ApiProperty({ example: '2026-08-21T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-21T12:00:00.000Z' })
  updatedAt: string;
}
