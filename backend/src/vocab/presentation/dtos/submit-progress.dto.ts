import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SubmitProgressItemDto {
  @ApiProperty({
    description: 'Flashcard ID being reviewed',
    example: 'clz123abc456',
  })
  @IsString()
  @IsNotEmpty()
  flashcardId: string;

  @ApiProperty({
    description: 'Whether the answer provided by the user was correct',
    example: true,
  })
  @Transform(({ obj }: { obj: unknown }) =>
    typeof obj === 'object' && obj !== null && 'isCorrect' in obj ? obj.isCorrect : undefined,
  )
  @IsBoolean()
  isCorrect: boolean;
}

export class SubmitProgressDto {
  @ApiProperty({
    description: 'Array of study review results for cards in the deck',
    type: [SubmitProgressItemDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SubmitProgressItemDto)
  results: SubmitProgressItemDto[];
}
