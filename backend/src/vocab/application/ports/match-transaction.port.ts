import { DeckRepositoryPort } from './deck-repository.port';
import { MatchRepositoryPort } from './match-repository.port';

export type MatchTransactionContext = {
  deckRepository: Pick<DeckRepositoryPort, 'findById'>;
  matchRepository: MatchRepositoryPort;
};

export interface MatchTransactionPort {
  run<T>(work: (context: MatchTransactionContext) => Promise<T>): Promise<T>;
}
