import { PaginateOptions } from '../../../common/pagination/paginate';

export interface GetMatchLeaderboardQuery extends PaginateOptions {
  deckId: string;
  userId?: string | null;
}
