import { ApiProperty } from '@nestjs/swagger';

export class ToggleStarResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the flashcard',
    example: 'clz123card456',
  })
  flashcardId: string;

  @ApiProperty({
    description: 'Updated starred status of the card',
    example: true,
  })
  isStarred: boolean;
}
