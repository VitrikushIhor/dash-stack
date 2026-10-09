import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ImportedFlashcardDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  term: string;

  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  definition: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  example?: string;

  @ApiPropertyOptional({ maxLength: 2048 })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  imageUrl?: string;
}

export class ImportFlashcardsDto {
  @ApiProperty({
    description: 'Client-generated id retained for a retry of this exact import',
    maxLength: 100,
  })
  @IsString()
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/)
  importId: string;

  @ApiProperty({ type: [ImportedFlashcardDto], minItems: 1, maxItems: 2000 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2000)
  @ValidateNested({ each: true })
  @Type(() => ImportedFlashcardDto)
  cards: ImportedFlashcardDto[];
}

export class ImportFlashcardsResponseDto {
  @ApiProperty()
  importId: string;

  @ApiProperty({ type: [String] })
  cardIds: string[];

  @ApiProperty()
  importedCount: number;

  @ApiProperty()
  idempotent: boolean;
}
