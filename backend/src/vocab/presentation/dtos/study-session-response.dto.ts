import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VocabProgressStatus } from '../../domain/enums/vocab.enums';

export class StudyCardProgressDto {
  @ApiPropertyOptional({
    description: 'Unique identifier of the progress record (null if not studied yet)',
    example: 'clz123prog456',
    nullable: true,
  })
  id: string | null;

  @ApiProperty({
    description: 'Current mastery status of the flashcard',
    enum: VocabProgressStatus,
    example: VocabProgressStatus.LEARNING,
  })
  status: VocabProgressStatus;

  @ApiProperty({
    description: 'Current Leitner SRS box level (1 to 5)',
    example: 2,
  })
  box: number;

  @ApiProperty({
    description: 'Whether the card is starred by the user for priority practice',
    example: false,
  })
  isStarred: boolean;

  @ApiProperty({
    description: 'Consecutive correct answers streak',
    example: 2,
  })
  correctStreak: number;

  @ApiProperty({
    description: 'Total number of correct answers for this card',
    example: 5,
  })
  correctCount: number;

  @ApiProperty({
    description: 'Total number of incorrect answers for this card',
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
    description: 'ISO timestamp when next SRS review is due',
    example: '2026-08-25T10:00:00.000Z',
    nullable: true,
  })
  nextReviewAt: string | null;
}

export class StudyCardResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the flashcard',
    example: 'clz123card456',
  })
  id: string;

  @ApiProperty({
    description: 'Deck ID the card belongs to',
    example: 'clz123deck456',
  })
  deckId: string;

  @ApiProperty({
    description: 'Word / term to learn',
    example: 'Algorithm',
  })
  term: string;

  @ApiProperty({
    description: 'Definition or meaning of the word',
    example: 'A step-by-step procedure for solving a problem.',
  })
  definition: string;

  @ApiPropertyOptional({
    description: 'Example sentence',
    example: 'The algorithm sorted the list in linear time.',
    nullable: true,
  })
  example: string | null;

  @ApiPropertyOptional({
    description: 'Illustrative image URL',
    example: 'https://images.unsplash.com/photo-1526374965328',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    description: '0-based position order in the deck',
    example: 1,
  })
  position: number;

  @ApiProperty({
    description: 'User learning progress metadata for this card',
    type: StudyCardProgressDto,
  })
  progress: StudyCardProgressDto;
}
