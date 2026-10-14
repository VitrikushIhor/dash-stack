import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const databaseUrl = process.env.LEARNING_TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('LEARNING_TEST_DATABASE_URL is required; no .env fallback');
const target = new URL(databaseUrl);
if (
  !['localhost', '127.0.0.1'].includes(target.hostname) ||
  target.pathname !== '/learning_foundation_test'
) {
  throw new Error(
    'Learning migration tests require the dedicated local learning_foundation_test DB',
  );
}

describe('Learning foundation PostgreSQL constraints', () => {
  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
  });
  let ownerId: string;
  let testId: string;
  let versionId: string;
  let openingId: string;

  beforeAll(async () => {
    await client.connect();
  });

  beforeEach(async () => {
    ownerId = randomUUID();
    testId = randomUUID();
    versionId = randomUUID();
    openingId = randomUUID();
    await client.query('BEGIN');
    await client.query('INSERT INTO "User" (id, email, "updatedAt") VALUES ($1, $2, NOW())', [
      ownerId,
      `${ownerId}@example.test`,
    ]);
    await client.query('INSERT INTO learning_test_lineage (id, root_id) VALUES ($1, $1)', [testId]);
    await client.query(
      `INSERT INTO learning_tests (id, owner_user_id, visibility, lineage_id, updated_at)
       VALUES ($1, $2, 'PRIVATE', $1, NOW())`,
      [testId, ownerId],
    );
    await client.query(
      `INSERT INTO learning_test_versions (id, test_id, version_number, scoring_version, max_points)
       VALUES ($1, $2, 1, 1, 1)`,
      [versionId, testId],
    );
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
  });

  afterAll(async () => {
    await client.end();
  });

  async function openTest(kind: 'GUEST' | 'USER' = 'GUEST'): Promise<void> {
    await client.query(
      `INSERT INTO learning_test_openings
       (id, test_id, test_version_id, user_id, principal_kind, principal_key,
        guest_secret_hash, presentation_seed, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'presentation', NOW(), NOW() + INTERVAL '24 hours')`,
      [
        openingId,
        testId,
        versionId,
        kind === 'USER' ? ownerId : null,
        kind,
        kind === 'USER' ? ownerId : openingId,
        kind === 'GUEST' ? randomUUID() : null,
      ],
    );
  }

  async function submitGuest(
    principalKey = openingId,
    submittedVersion = versionId,
  ): Promise<void> {
    await client.query(
      `INSERT INTO learning_test_attempts
       (id, opening_id, test_id, test_version_id, principal_kind, principal_key,
        guest_result_secret_hash, answers, presentation, result, submitted_at, expires_at)
       VALUES ($1, $2, $3, $4, 'GUEST', $5, $6, '{}', '{}', '{}', NOW(), NOW() + INTERVAL '24 hours')`,
      [randomUUID(), openingId, testId, submittedVersion, principalKey, randomUUID()],
    );
  }

  async function insertDraftGroups(): Promise<void> {
    await client.query(
      'INSERT INTO learning_test_drafts (test_id, updated_at) VALUES ($1, NOW())',
      [testId],
    );
    await client.query(
      `INSERT INTO learning_test_draft_groups (test_id, group_key, position, instruction, material)
       VALUES ($1, 'first', 0, '{}', '{}'), ($1, 'second', 1, '{}', '{}')`,
      [testId],
    );
  }

  it('should_create_no_attempt_when_only_an_opening_exists', async () => {
    await openTest();

    const attempts = await client.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM learning_test_attempts WHERE opening_id = $1',
      [openingId],
    );

    expect(attempts.rows).toEqual([{ count: 0 }]);
    await expect(submitGuest()).resolves.toBeUndefined();
  });

  it('should_reject_a_completion_when_the_principal_differs_from_the_opening', async () => {
    await openTest();

    await expect(submitGuest('another-page')).rejects.toMatchObject({
      code: '23503',
      constraint: 'learning_attempt_opening_principal_fk',
    });
  });

  it('should_reject_a_completion_when_it_uses_another_version_of_the_same_test', async () => {
    await openTest();
    const nextVersion = randomUUID();
    await client.query(
      `INSERT INTO learning_test_versions (id, test_id, version_number, scoring_version, max_points)
       VALUES ($1, $2, 2, 1, 1)`,
      [nextVersion, testId],
    );

    await expect(submitGuest(openingId, nextVersion)).rejects.toMatchObject({
      code: '23503',
      constraint: 'learning_attempt_opening_version_fk',
    });
  });

  it('should_reject_a_second_completion_when_the_opening_already_has_one', async () => {
    await openTest();
    await submitGuest();

    await expect(submitGuest()).rejects.toMatchObject({
      code: '23505',
      constraint: 'learning_test_attempts_opening_id_key',
    });
  });

  it('should_reject_an_extended_guest_lifetime_when_updating_a_result', async () => {
    await openTest();
    await submitGuest();

    await expect(
      client.query(
        `UPDATE learning_test_attempts SET expires_at = submitted_at + INTERVAL '3 days'
         WHERE opening_id = $1`,
        [openingId],
      ),
    ).rejects.toMatchObject({ code: '23514', constraint: 'learning_attempt_expiry_ck' });
  });

  it('should_allow_position_swaps_when_the_final_order_is_unique', async () => {
    await insertDraftGroups();

    await client.query(
      "UPDATE learning_test_draft_groups SET position = 1 WHERE test_id = $1 AND group_key = 'first'",
      [testId],
    );
    await client.query(
      "UPDATE learning_test_draft_groups SET position = 0 WHERE test_id = $1 AND group_key = 'second'",
      [testId],
    );
    await client.query('SET CONSTRAINTS ALL IMMEDIATE');

    const groups = await client.query<{ group_key: string }>(
      'SELECT group_key FROM learning_test_draft_groups WHERE test_id = $1 ORDER BY position',
      [testId],
    );
    expect(groups.rows).toEqual([{ group_key: 'second' }, { group_key: 'first' }]);
  });

  it('should_reject_duplicate_positions_when_deferred_constraints_are_checked', async () => {
    await insertDraftGroups();
    await client.query('UPDATE learning_test_draft_groups SET position = 0 WHERE test_id = $1', [
      testId,
    ]);

    await expect(client.query('SET CONSTRAINTS ALL IMMEDIATE')).rejects.toMatchObject({
      code: '23505',
      constraint: 'learning_test_draft_groups_test_id_position_key',
    });
  });

  it('should_reject_account_deletion_when_owned_content_is_still_live', async () => {
    await expect(client.query('DELETE FROM "User" WHERE id = $1', [ownerId])).rejects.toMatchObject(
      {
        code: '23514',
        constraint: 'learning_tests_owner_ck',
      },
    );
  });

  it('should_preserve_principal_binding_when_account_erasure_is_coordinated', async () => {
    await openTest('USER');
    await client.query(
      `INSERT INTO learning_test_attempts
       (id, opening_id, test_id, test_version_id, user_id, principal_kind, principal_key,
        answers, presentation, result, submitted_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, 'USER', $5, '{}', '{}', '{}', NOW(), NOW() + INTERVAL '3 days')`,
      [randomUUID(), openingId, testId, versionId, ownerId],
    );

    await client.query('UPDATE learning_tests SET deleted_at = NOW() WHERE id = $1', [testId]);
    await client.query('UPDATE learning_test_openings SET revoked_at = NOW() WHERE id = $1', [
      openingId,
    ]);
    await client.query(
      'UPDATE learning_test_attempts SET erased_at = NOW() WHERE opening_id = $1',
      [openingId],
    );
    await client.query('DELETE FROM "User" WHERE id = $1', [ownerId]);

    const result = await client.query<{ user_id: string | null; principal_key: string }>(
      'SELECT user_id, principal_key FROM learning_test_attempts WHERE opening_id = $1',
      [openingId],
    );
    expect(result.rows).toEqual([{ user_id: null, principal_key: ownerId }]);
  });
});
