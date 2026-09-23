import { Deck } from '../../domain/entities/deck.entity';
import { CEFRLevel, DeckStatus, DeckVisibility } from '../../domain/enums/vocab.enums';
import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { PaginateOptions } from '../../../common/pagination/paginate';

export interface FindMyDecksFilter {
  ownerUserId: string;
  status?: DeckStatus;
}

export interface SearchPublicDecksFilter extends PaginateOptions {
  query?: string;
  level?: string;
  language?: string;
  tags?: string[];
  limit?: number;
}

export interface UpdateDeckMetadata {
  title?: string;
  description?: string | null;
  language?: string;
  level?: CEFRLevel | null;
  tags?: string[];
  visibility?: DeckVisibility;
}

export interface DeckRepositoryPort {
  save(deck: Deck): Promise<Deck>;
  updateMetadata(deckId: string, metadata: UpdateDeckMetadata): Promise<Deck>;
  publish(deckId: string): Promise<Deck>;
  findForAccess(id: string): Promise<Deck | null>;
  findById(id: string): Promise<Deck | null>;
  findBySlug(slug: string): Promise<Deck | null>;
  findMyDecks(filter: FindMyDecksFilter): Promise<Deck[]>;
  searchPublicDecks(filter: SearchPublicDecksFilter): Promise<PaginatedResult<Deck>>;
  countFlashcardsByDeckId(deckId: string): Promise<number>;
  forkDeck(sourceDeckId: string, forkedDeck: Deck): Promise<Deck>;
  delete(id: string): Promise<void>;
}
