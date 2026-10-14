# Learning PostgreSQL proposal verification

Recorded: 2026-10-13. Result: **29 checks passed** in the authorized isolated verification run immediately preceding this report.

## Environment and scope

PostgreSQL `15.19 (Debian 15.19-1.pgdg13+2)`, Docker image `postgres:15`, pulled digest `sha256:c961aa287d8698297cb26cdfadfbe9fd2cbaf77e53cfffe9636e8d8a1e4d842c`. Container `learning-schema-review-20261012` used network mode `none`, no published ports and a tmpfs database directory. No application database was contacted. The existing Prisma datamodel was converted to baseline SQL with schema-only `prisma migrate diff`; that baseline and the proposed SQL were executed only inside the disposable database.

On 2026-10-13, the combined existing schema, User inverse relations and 25-model fragment validated with the installed Prisma CLI `7.9.1`. Prisma Client generated successfully with the repository's configured `prisma-client-js` provider into a temporary directory. A fresh schema-to-schema Prisma diff produced the same 25 `CREATE TABLE` definitions as `forward.sql` (table names, columns and primary keys); it contained no changes to the existing `User` table. The temporary generated client and schema were removed after comparison. This confirms datamodel/client generation and additive table shape; SQL-managed PostgreSQL invariants were validated separately below.

Evidence source: successful tool/process output in this conversation, including final `ALL PASS 26` and three additional successful guest/receipt checks. The temporary harness and JSON summary are no longer present after the environment resumed; this report does not claim a persisted executable regression suite or a fresh rerun on 2026-10-13.

Cleanup confirmed on 2026-10-13: the stopped temporary container was removed, and a subsequent container inventory found no matching container.

Current reviewed artifact SHA-256 values:

- `forward.sql` after principal-binding fix: `916eb1b3c9d8f0b345846abd34137ae98266e13027cd955095a11e6e19268b5e`
- `rollback-empty-only.sql`: `252b99ace2663bbc3124ef27864bbad4ce02135a147c5202c02e892c369d4649`

## Prisma-to-SQL parity audit

The fresh Prisma diff contains 53 indexes and 46 foreign keys. All generated indexes and foreign keys are present in `forward.sql`; six generated unique indexes are represented as deferred unique constraints to permit ordered edits. The proposal adds two public-catalog partial indexes and ten SQL-managed compound foreign keys. The 25 generated table definitions match the proposal's table names, columns and primary keys. No existing table is altered by the generated diff.

The principal-binding gap found during review is fixed in the current proposal. `LearningOpening` now has a composite unique key on `(id, principal_kind, principal_key)`, and attempts reference that exact tuple in addition to their opening/test/version binding. On 2026-10-13, the combined Prisma schema validated, the configured client generated, and a fresh schema diff included the matching unique index. The updated full forward SQL applied on isolated PostgreSQL 15.19. A matching guest principal was accepted; mismatched `principal_key` and `principal_kind` values were rejected by `learning_attempt_opening_principal_fk`. A registered-user opening/attempt also remained linked after the coordinated revocation, erasure marking and User FK nulling required by account deletion.

## Application invariants requiring implementation evidence

The data model provides the records and some relational guards, but it cannot by itself guarantee these agreed operations:

- Publish a saved snapshot atomically, increment versions once, pin topic exercises to exact test versions, and reject blocked/ineligible exercises.
- Compare expected draft, topic-membership, access and lineage revisions while locking related rows. Stale copies, saves, publication and block previews must conflict without changing the selected snapshot or leaking protected content.
- Never update or delete published version contents; perform copy, detach, blocked-topic keep/delete and account erasure with coordinated ownership, restriction, evidence and media-reference updates.
- Recheck current session/role/access and receipt payload identity on replay; enforce ticket admission expiry and fixed opening/result deadlines. The receipt uniqueness key prevents duplicate rows but does not prove that a retry has the same payload or is still authorized.
- Enforce content/document/question limits and semantic validation at the application boundary; clean attempts, openings, receipts, evidence, audit and media in dependency order without deleting retained copies or references.
- Assign/revoke platform roles with audit and atomic last-active-admin protection; prevent self-moderation and recheck privilege at mutation time.

These are transaction/use-case and storage-boundary obligations, not failed database checks. They need focused PostgreSQL/application integration scenarios before implementation is considered complete. The guest capability derivation and retry windows are now specified; implementation and focused authorization/replay tests remain outstanding.

Product decision now confirmed: when a blocked topic is deleted with exercises kept, preserve each active topic case ID on every kept exercise before detaching it. Lifting that case clears its propagated targets, while independent test cases remain. This is an application transaction invariant and does not require new schema fields in the current model.

## Passed checks

1. Existing Prisma baseline creates successfully in the isolated database.
2. Forward SQL creates all 25 new tables.
3. Empty rollback removes only the new tables and preserves the existing baseline.
4. Forward SQL reapplies after empty rollback.
5. A concurrent INSERT committed before rollback acquires its locks is observed: rollback rejects and preserves the row.
6. Rollback lock timeout preserves every table.
7. An INSERT started after rollback holds its locks blocks, then cannot commit into dropped tables.
8. A cross-test current publication pointer is rejected.
9. Cross-owner topic membership is rejected.
10. A live resource cannot lose its owner.
11. A lineage parent cannot belong to another root.
12. An invalid question kind is rejected.
13. Deferred uniqueness permits an atomic group-position swap.
14. Duplicate final group positions are rejected at commit.
15. Opening/test-version membership is enforced.
16. Opening expiry must equal creation plus 24 hours.
17. Opening principal mode is enforced.
18. Authenticated result expiry must equal submission plus three days.
19. A completed attempt cannot switch to a different opening's test/version.
20. A retained result prevents deletion of its referenced opening.
21. A media use requires exactly one retaining content container.
22. Image dimension bounds are enforced.
23. Unknown platform role values are rejected.
24. Populated rollback refuses without data loss.
25. Uncoordinated account deletion is rejected.
26. Coordinated owner tombstoning, opening revocation and attempt erasure markers allow User FK nulling.
27. Guest result expiry must equal submission plus 24 hours.
28. Receipt expiry must equal creation plus 12 hours.
29. Duplicate principal/operation receipts are rejected.

Concurrency checks synchronized independent psql sessions through `pg_stat_activity`, rather than assuming a fixed sleep placed the writer correctly. The lock-timeout case used the proposal's five-second timeout.

## Limits of the original proposal run

These checks validate selected actual PostgreSQL constraints and the rollback race fix, including the new principal-binding cases. They do not prove application authorization, scoring, capability delivery/replay, media cleanup, last-admin protection or moderation transactions. Whole publish/copy/block/cleanup races, project migration-history drift, new dependencies/builds, seed, browser Learning flows and deployment remain unverified. Existing application unit/type/lint passes are separate regression evidence.

The original proposal run did not install a runtime migration or dependencies, run the seed, commit or push. The runtime work performed afterward is recorded below.

## Runtime foundation migration verification

On 2026-10-13, the approved `learning-models.prisma`, User inverse fields and `forward.sql` were installed into `backend/prisma/schema.prisma`, `backend/prisma/migrations/20261013090000_add_learning_foundation/migration.sql`, and the generated client. A disposable PostgreSQL 15 database was created from all 24 existing migration-history entries; Prisma successfully applied the new migration as entry 25. It used a loopback-only ephemeral port and a tmpfs data directory. The exact test database was removed after verification. No project database, seed, or deployment was touched.

The final schema-to-database diff reports only the ten documented SQL-managed compound foreign keys. All Prisma-representable indexes and constraints, including `learning_opening_identity_unique`, match the runtime datamodel. The runtime migration body matches the reviewed `forward.sql` body byte-for-byte. The combined schema validates and Prisma Client generation succeeds.

Nine persistent PostgreSQL integration checks pass: an opening alone creates no attempt; mismatched principal, mismatched version, repeated completion and extended guest result expiry are rejected; legal order swaps work and duplicate final positions fail; live owned content prevents account deletion; coordinated erasure preserves principal binding. The suite explicitly accepts only a loopback URL whose database name is `learning_foundation_test`; it never falls back to the app `.env` database.

The empty-only rollback was executed on the disposable database. It refused a populated receipt table while preserving its row, succeeded after removal of that fixture, removed the 25 Learning tables, and the migration reapplied successfully. These are destructive SQL checks against the throwaway database only.

An end-to-end dependency smoke test also boots Nest GraphQL 13 with Apollo Server 5 and Express 5, runs a typed query, and checks the configured CSRF guard. Both checks pass. It does not exercise a Learning API endpoint or implement the product feature.

Backend unit tests pass (142 suites, 923 tests); backend typecheck, lint and production build pass. The two new integration suites pass (11 tests total). A production dependency audit of the changed lockfile reports the same 30 advisories as the pre-change lockfile (14 moderate, 16 high, 1 critical); no new advisory was introduced. The installed Apollo peer graph still emits a non-security peer warning for its unused deprecated Playground plugin, and pnpm reports existing peer mismatches for SWC/Chokidar and ts-jest/TypeScript. No peer warning was suppressed.

Remaining: full resolver/application authorization and transaction races, upload/storage behavior, moderation and cleanup integration, seed safety, real browser flow, project migration deployment and release checks. These require the feature implementation and are not claimed passed.
