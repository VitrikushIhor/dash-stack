import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsOptional,
  IsISO8601,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { UpdateDeckDto } from './update-deck.dto';
import { DECK_EDITOR_MAX_CARDS } from '../../application/constants/import-limits';

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
  @IsUUID()
  operationId: string;

  @IsISO8601()
  expectedUpdatedAt: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateDeckDto)
  metadata: UpdateDeckDto;

  @IsArray()
  @ArrayMaxSize(DECK_EDITOR_MAX_CARDS)
  @ValidateNested({ each: true })
  @Type(() => DeckEditorCardDto)
  cards: DeckEditorCardDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deletedCardIds?: string[];
}
