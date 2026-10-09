import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReorderFlashcardsDto {
  @ApiProperty({
    description: 'Array of flashcard IDs in the new desired order',
    type: [String],
    example: ['card-id-3', 'card-id-1', 'card-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  orderedCardIds: string[];
}
