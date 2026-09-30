import { PaginatedResult } from '../../../../common/pagination/pagination.models';
export interface SessionSummary {
  id: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  userAgent: string | null;
}

export interface SessionManagementPort {
  listActive(
    userId: string,
    now: Date,
    page: number,
    perPage: number,
  ): Promise<PaginatedResult<SessionSummary>>;
  revokeOwned(userId: string, sessionId: string, now: Date): Promise<boolean>;
}
