import { PrismaAuthSessionRepository } from '../../infrastructure/persistence/prisma-auth-session.repository';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import {
  createIsolatedPostgres,
  IsolatedPostgres,
} from '../../../common/testing/isolated-postgres';
import { PrismaSessionManagementRepository } from '../../infrastructure/persistence/prisma-session-management.repository';
import { ManageSessionsUseCase } from '../../application/use-cases/manage-sessions.use-case';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

describe('Session management PostgreSQL', () => {
  let database: IsolatedPostgres;
  let useCase: ManageSessionsUseCase;
  let owner: string;
  let stranger: string;
  let current: string;
  let other: string;
  let foreign: string;
  beforeAll(async () => {
    database = await createIsolatedPostgres(databaseUrl);
    useCase = new ManageSessionsUseCase(new PrismaSessionManagementRepository(database.prisma));
  });
  beforeEach(async () => {
    const users = await Promise.all(
      ['owner', 'stranger'].map((name) =>
        database.prisma.user.create({ data: { email: `${name}-${randomUUID()}@example.test` } }),
      ),
    );
    owner = users[0].id;
    stranger = users[1].id;
    const sessions = await Promise.all(
      [owner, owner, stranger].map((userId) =>
        database.prisma.authSession.create({
          data: {
            userId,
            credentialHash: randomUUID().replaceAll('-', '').padEnd(64, '0'),
            expiresAt: new Date(Date.now() + 3600000),
          },
        }),
      ),
    );
    [current, other, foreign] = sessions.map((session) => session.id);
  });
  afterEach(async () => {
    await database.prisma.user.deleteMany({ where: { id: { in: [owner, stranger] } } });
  });
  afterAll(async () => database.close());

  it('should_list_only_owned_active_sessions_without_credentials', async () => {
    await database.prisma.authSession.createMany({
      data: [
        { userId: owner, credentialHash: 'a'.repeat(64), expiresAt: new Date(0) },
        {
          userId: owner,
          credentialHash: 'b'.repeat(64),
          expiresAt: new Date(Date.now() + 3600000),
          revokedAt: new Date(),
        },
      ],
    });
    const result = await useCase.list(owner, current, 1);
    expect(result.data).toHaveLength(2);
    expect(result.data.find((item) => item.id === current)?.isCurrent).toBe(true);
    expect(result.data.find((item) => item.id === other)?.isCurrent).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/credentialHash|userId|ipAddress/);
    expect(result.meta).toEqual({
      total: 2,
      lastPage: 1,
      currentPage: 1,
      perPage: 20,
      prev: null,
      next: null,
    });
  });
  it('should_record_activity_once_per_five_minutes_under_concurrent_requests', async () => {
    const now = new Date();
    const previous = new Date(now.getTime() - 300000);
    await database.prisma.authSession.update({
      where: { id: current },
      data: { lastUsedAt: previous },
    });
    const repository = new PrismaAuthSessionRepository(database.prisma);

    await Promise.all(
      Array.from({ length: 5 }, () => repository.recordActivity(current, owner, now)),
    );
    await repository.recordActivity(current, owner, new Date(now.getTime() + 60000));

    const stored = await database.prisma.authSession.findUniqueOrThrow({ where: { id: current } });
    expect(stored.lastUsedAt).toEqual(now);
    const list = await useCase.list(owner, current, 1);
    expect(list.data.find((item) => item.id === current)?.lastUsedAt).toBe(now.toISOString());
  });

  it('should_not_record_activity_for_foreign_revoked_or_expired_sessions', async () => {
    const now = new Date();
    const previous = new Date(now.getTime() - 600000);
    await database.prisma.authSession.updateMany({
      where: { id: { in: [current, other, foreign] } },
      data: { lastUsedAt: previous },
    });
    await database.prisma.authSession.update({ where: { id: current }, data: { revokedAt: now } });
    await database.prisma.authSession.update({ where: { id: other }, data: { expiresAt: now } });
    const repository = new PrismaAuthSessionRepository(database.prisma);

    await Promise.all(
      [current, other, foreign].map((id) => repository.recordActivity(id, owner, now)),
    );

    const sessions = await database.prisma.authSession.findMany({
      where: { id: { in: [current, other, foreign] } },
    });
    expect(sessions.every((session) => session.lastUsedAt.getTime() === previous.getTime())).toBe(
      true,
    );
  });

  it('should_revoke_only_the_selected_owned_session_idempotently', async () => {
    await expect(useCase.revoke(owner, current, foreign)).rejects.toThrow('Session not found');
    expect(
      (await database.prisma.authSession.findUniqueOrThrow({ where: { id: foreign } })).revokedAt,
    ).toBeNull();
    await expect(useCase.revoke(owner, current, other)).resolves.toEqual({
      revokedCurrentSession: false,
    });
    await expect(useCase.revoke(owner, current, other)).resolves.toEqual({
      revokedCurrentSession: false,
    });
    expect(
      (await database.prisma.authSession.findUniqueOrThrow({ where: { id: other } })).revokedAt,
    ).not.toBeNull();
    expect(
      (await database.prisma.authSession.findUniqueOrThrow({ where: { id: current } })).revokedAt,
    ).toBeNull();
    await expect(useCase.revoke(owner, current, current)).resolves.toEqual({
      revokedCurrentSession: true,
    });
  });
  it('should_return_empty_page_with_metadata_when_no_active_sessions_remain', async () => {
    await database.prisma.authSession.updateMany({
      where: { userId: owner },
      data: { revokedAt: new Date() },
    });

    const result = await useCase.list(owner, current, 1);

    expect(result.data).toEqual([]);
    expect(result.meta).toEqual({
      total: 0,
      lastPage: 1,
      currentPage: 1,
      perPage: 20,
      prev: null,
      next: null,
    });
  });

  it('should_paginate_without_duplicates', async () => {
    await database.prisma.authSession.createMany({
      data: Array.from({ length: 20 }, () => ({
        userId: owner,
        credentialHash: randomUUID().replaceAll('-', '').padEnd(64, '0'),
        expiresAt: new Date(Date.now() + 3600000),
      })),
    });
    const first = await useCase.list(owner, current, 1);
    const second = await useCase.list(owner, current, 2);
    expect(first.data).toHaveLength(20);
    expect(first.meta).toEqual({
      total: 22,
      lastPage: 2,
      currentPage: 1,
      perPage: 20,
      prev: null,
      next: 2,
    });
    expect(second.data).toHaveLength(2);
    expect(second.meta).toEqual({
      total: 22,
      lastPage: 2,
      currentPage: 2,
      perPage: 20,
      prev: 1,
      next: null,
    });
    expect(new Set([...first.data, ...second.data].map((item) => item.id)).size).toBe(22);
  });
});
