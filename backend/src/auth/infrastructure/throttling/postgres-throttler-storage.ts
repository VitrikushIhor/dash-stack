import type { ThrottlerStorage } from '@nestjs/throttler';
import { PrismaService } from 'nestjs-prisma';

interface RateLimitRow {
  hits: number;
  expiresAt: Date;
  now: Date;
}

export class PostgresThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly prisma: PrismaService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): ReturnType<ThrottlerStorage['increment']> {
    if (
      !Number.isSafeInteger(ttl) ||
      ttl < 1 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      blockDuration !== ttl
    ) {
      throw new Error('Unsupported auth throttle configuration');
    }

    const rows = await this.prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO "auth_rate_limits" ("key", "hits", "expiresAt")
      VALUES (${key}, 1, NOW() + (${ttl} * INTERVAL '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "hits" = CASE
          WHEN "auth_rate_limits"."expiresAt" <= NOW() THEN 1
          ELSE LEAST("auth_rate_limits"."hits" + 1, ${limit + 1})
        END,
        "expiresAt" = CASE
          WHEN "auth_rate_limits"."expiresAt" <= NOW()
            THEN NOW() + (${ttl} * INTERVAL '1 millisecond')
          ELSE "auth_rate_limits"."expiresAt"
        END
      RETURNING "hits", "expiresAt", NOW() AS "now"
    `;
    const row = rows[0];
    if (!row) throw new Error('Auth throttle storage failed');

    const secondsRemaining = Math.max(
      0,
      Math.ceil((row.expiresAt.getTime() - row.now.getTime()) / 1000),
    );
    const isBlocked = row.hits > limit;
    return {
      totalHits: row.hits,
      timeToExpire: secondsRemaining,
      isBlocked,
      timeToBlockExpire: isBlocked ? secondsRemaining : 0,
    };
  }
}
