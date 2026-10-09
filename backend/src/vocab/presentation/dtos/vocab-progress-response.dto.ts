import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VocabProgressStatus } from '../../domain/enums/vocab.enums';

export class VocabProgressResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the progress record',
    example: 'clz123prog456',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'clz123user456',
  })
  userId: string;

  @ApiProperty({
    description: 'Deck ID',
    example: 'clz123deck456',
  })
  deckId: string;

  @ApiProperty({
    description: 'Flashcard ID',
    example: 'clz123card456',
  })
  flashcardId: string;

  @ApiProperty({
    description: 'Current mastery status',
    enum: VocabProgressStatus,
    example: VocabProgressStatus.LEARNING,
  })
  status: VocabProgressStatus;

  @ApiProperty({
    description: 'Current Leitner box (1 to 5)',
    example: 2,
  })
  box: number;

  @ApiProperty({
    description: 'Starred indicator for focused review',
    example: true,
  })
  isStarred: boolean;

  @ApiProperty({
    description: 'Consecutive correct streak',
    example: 2,
  })
  correctStreak: number;

  @ApiProperty({
    description: 'Total correct reviews',
    example: 3,
  })
  correctCount: number;

  @ApiProperty({
    description: 'Total incorrect reviews',
    example: 1,
  })
  incorrectCount: number;

  @ApiPropertyOptional({
    description: 'ISO timestamp of last review',
    example: '2026-08-22T10:00:00.000Z',
    nullable: true,
  })
  lastReviewedAt: string | null;

  @ApiPropertyOptional({
    description: 'ISO timestamp when next review is due',
    example: '2026-08-25T10:00:00.000Z',
    nullable: true,
  })
  nextReviewAt: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-08-22T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-08-22T10:00:00.000Z',
  })
  updatedAt: string;
}
