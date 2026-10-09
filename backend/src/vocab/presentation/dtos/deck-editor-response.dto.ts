import { ApiProperty } from '@nestjs/swagger';
import { DeckResponseDto } from './deck-response.dto';
import { FlashcardResponseDto } from './flashcard-response.dto';

export class DeckEditorResponseDto extends DeckResponseDto {
  @ApiProperty({ type: [FlashcardResponseDto] })
  declare flashcards: FlashcardResponseDto[];
}
