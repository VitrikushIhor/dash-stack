import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { StudyCardReadModel } from './study-card.read-model';

export interface DeckCardSelectionSummary {
  total: number;
  due: number;
  starred: number;
  dueAndStarred: number;
}

export interface BrowsedDeckCardsReadModel extends PaginatedResult<StudyCardReadModel> {
  summary: DeckCardSelectionSummary;
}
