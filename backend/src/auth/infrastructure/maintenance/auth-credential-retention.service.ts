import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

export const RATE_LIMIT_CLEANUP_BATCH_SIZE = 1_000;

export interface AuthCredentialRetentionResult {
  sessions: number;
  verificationTokens: number;
  rateLimits: number;
}

@Injectable()
export class AuthCredentialRetentionService {
  private readonly logger = new Logger(AuthCredentialRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async hasBacklog(before: Date): Promise<boolean> {
    const result = await this.prisma.$queryRaw<Array<{ backlog: boolean }>>`
      SELECT
        EXISTS(SELECT 1 FROM "auth_sessions" WHERE "expiresAt" <= ${before}) OR
        EXISTS(SELECT 1 FROM "VerificationToken" WHERE "expires" <= ${before}) OR
        EXISTS(SELECT 1 FROM "auth_rate_limits" WHERE "expiresAt" <= NOW()) AS "backlog"
    `;
    if (!result[0]) throw new Error('Auth credential retention backlog query failed');
    return result[0].backlog;
  }

  async run(before: Date, limit: number): Promise<AuthCredentialRetentionResult> {
    if (
      Number.isNaN(before.getTime()) ||
      before.getTime() > Date.now() ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new Error('Invalid auth credential retention batch');
    }

    const sessions = await this.prisma.$executeRaw`
      WITH victims AS (
        SELECT "id" FROM "auth_sessions"
        WHERE "expiresAt" <= ${before}
        ORDER BY "expiresAt", "id"
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      DELETE FROM "auth_sessions" WHERE "id" IN (SELECT "id" FROM victims)
    `;
    const verificationTokens = await this.prisma.$executeRaw`
      WITH victims AS (
        SELECT "id" FROM "VerificationToken"
        WHERE "expires" <= ${before}
        ORDER BY "expires", "id"
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      DELETE FROM "VerificationToken" WHERE "id" IN (SELECT "id" FROM victims)
    `;

    const rateLimits = await this.prisma.$executeRaw`
      WITH victims AS (
        SELECT "key" FROM "auth_rate_limits"
        WHERE "expiresAt" <= NOW()
        ORDER BY "expiresAt", "key"
        LIMIT ${RATE_LIMIT_CLEANUP_BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      DELETE FROM "auth_rate_limits" WHERE "key" IN (SELECT "key" FROM victims)
    `;

    const result = { sessions, verificationTokens, rateLimits };
    this.logger.log(
      `Expired auth credentials removed: sessions=${sessions} verification=${verificationTokens} rateLimits=${rateLimits}`,
    );
    return result;
  }
}
