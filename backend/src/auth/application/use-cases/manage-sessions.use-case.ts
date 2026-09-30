import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../common/exceptions/domain.exception';
import { SessionManagementPort } from '../ports/outgoing/session-management.port';

const PAGE_SIZE = 20;

@Injectable()
export class ManageSessionsUseCase {
  constructor(@Inject('SessionManagementPort') private readonly sessions: SessionManagementPort) {}

  async list(userId: string, currentSessionId: string, page: number) {
    const result = await this.sessions.listActive(userId, new Date(), page, PAGE_SIZE);
    return {
      data: result.data.map((session) => ({
        id: session.id,
        createdAt: session.createdAt.toISOString(),
        lastUsedAt: session.lastUsedAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        userAgent: session.userAgent,
        isCurrent: session.id === currentSessionId,
      })),
      meta: result.meta,
    };
  }

  async revoke(userId: string, currentSessionId: string, sessionId: string) {
    const found = await this.sessions.revokeOwned(userId, sessionId, new Date());
    if (!found) throw new NotFoundException('Session not found');
    return { revokedCurrentSession: sessionId === currentSessionId };
  }
}
