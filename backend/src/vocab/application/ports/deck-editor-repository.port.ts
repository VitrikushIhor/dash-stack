import { CEFRLevel, DeckVisibility } from '../../domain/enums/vocab.enums';
import { Deck } from '../../domain/entities/deck.entity';

export interface DeckEditorCardInput {
  id?: string;
  term: string;
  definition: string;
  example?: string | null;
  imageUrl?: string | null;
}

export interface DeckEditorMetadataInput {
  title?: string;
  description?: string | null;
  language?: string;
  level?: CEFRLevel | null;
  tags?: string[];
  visibility?: DeckVisibility;
}

export interface SaveDeckEditorCommand {
  deck: Deck;
  cards: DeckEditorCardInput[];
  deletedCardIds: string[];
}

export interface DeckEditorRepositoryPort {
  save(command: SaveDeckEditorCommand): Promise<Deck>;
}
