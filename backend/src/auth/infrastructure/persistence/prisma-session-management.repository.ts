import { Prisma } from '@prisma/client';
import { paginate } from '../../../common/pagination/paginate';
import { PaginatedResult } from '../../../common/pagination/pagination.models';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  SessionManagementPort,
  SessionSummary,
} from '../../application/ports/outgoing/session-management.port';

@Injectable()
export class PrismaSessionManagementRepository implements SessionManagementPort {
  constructor(private readonly prisma: PrismaService) {}

  listActive(
    userId: string,
    now: Date,
    page: number,
    perPage: number,
  ): Promise<PaginatedResult<SessionSummary>> {
    return paginate<SessionSummary, Prisma.AuthSessionFindManyArgs>(
      this.prisma.authSession,
      {
        where: { userId, revokedAt: null, expiresAt: { gt: now } },
        select: { id: true, createdAt: true, lastUsedAt: true, expiresAt: true, userAgent: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      },
      { page, perPage },
    );
  }

  async revokeOwned(userId: string, sessionId: string, now: Date): Promise<boolean> {
    const result = await this.prisma.authSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: now },
    });
    if (result.count > 0) return true;
    return (await this.prisma.authSession.count({ where: { id: sessionId, userId } })) > 0;
  }
}
