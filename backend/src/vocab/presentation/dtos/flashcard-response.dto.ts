import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FlashcardResponseDto {
  @ApiProperty({ example: 'card_12345' })
  id: string;

  @ApiProperty({ example: 'deck_12345' })
  deckId: string;

  @ApiProperty({ example: 'ephemeral' })
  term: string;

  @ApiProperty({ example: 'Lasting for a very short time' })
  definition: string;

  @ApiPropertyOptional({ example: 'Fashions are ephemeral.' })
  example?: string | null;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  imageUrl?: string | null;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: '2026-08-21T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-08-21T12:00:00.000Z' })
  updatedAt: string;
}
