import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UpdateDeckDto } from './update-deck.dto';

export class DeckEditorCardDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @MaxLength(255)
  term: string;

  @IsString()
  @MaxLength(1000)
  definition: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  example?: string | null;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;
}

export class SaveDeckEditorDto {
  @ValidateNested()
  @Type(() => UpdateDeckDto)
  metadata: UpdateDeckDto;

  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => DeckEditorCardDto)
  cards: DeckEditorCardDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deletedCardIds?: string[];
}
