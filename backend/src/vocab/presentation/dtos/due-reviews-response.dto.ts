import { ApiProperty } from '@nestjs/swagger';

export class DeckDueReviewsDto {
  @ApiProperty({
    description: 'Unique identifier of the deck',
    example: 'clz123deck456',
  })
  deckId: string;

  @ApiProperty({
    description: 'Title of the deck',
    example: 'Oxford 3000 Essential Words',
  })
  deckTitle: string;

  @ApiProperty({
    description: 'Number of cards due for review in this deck today',
    example: 7,
  })
  dueCount: number;
}

export class DueReviewsResponseDto {
  @ApiProperty({
    description: 'Total number of cards due for SRS review across all user decks',
    example: 15,
  })
  totalDue: number;

  @ApiProperty({
    description: 'Breakdown of due card counts grouped by deck',
    type: [DeckDueReviewsDto],
  })
  perDeck: DeckDueReviewsDto[];
}
