import { SESSION_ACTIVITY_INTERVAL_MS } from '../../domain/policies/session-activity.policy';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  AuthSessionModel,
  AuthSessionRepositoryPort,
  CreateAuthSessionData,
} from '../../application/ports/outgoing/auth-session.repository.port';

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async recordActivity(id: string, userId: string, now: Date): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        id,
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
        lastUsedAt: { lte: new Date(now.getTime() - SESSION_ACTIVITY_INTERVAL_MS) },
      },
      data: { lastUsedAt: now },
    });
  }

  create(data: CreateAuthSessionData): Promise<AuthSessionModel> {
    return this.prisma.authSession.create({ data });
  }

  findByCredentialHash(credentialHash: string): Promise<AuthSessionModel | null> {
    return this.prisma.authSession.findUnique({ where: { credentialHash } });
  }

  findById(id: string): Promise<AuthSessionModel | null> {
    return this.prisma.authSession.findUnique({ where: { id } });
  }

  revokeByCredentialHash(credentialHash: string, revokedAt: Date): Promise<{ count: number }> {
    return this.prisma.authSession.updateMany({
      where: { credentialHash, revokedAt: null },
      data: { revokedAt },
    });
  }

  revokeAllByUserId(userId: string, revokedAt: Date): Promise<{ count: number }> {
    return this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt },
    });
  }
}
