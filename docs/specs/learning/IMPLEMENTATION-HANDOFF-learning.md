# Learning — implementation handoff

Updated: 2026-10-13. Status: first schema/dependency increment implemented and verified against an isolated PostgreSQL database; no application database was used.

## Product baseline

The [feature specification](FEATURE-SPEC-learning.md) is the product source of truth. The [question contract](QUESTION-CONTRACTS-learning.md) defines scoring and answer shapes; the [state contract](STATE-AND-ACCESS-learning.md) defines access and lifecycle. The [ADR](../../adr/0010-learning-tests-and-topics.md) describes architecture, and the [implementation plan](IMPLEMENTATION-PLAN-learning.md) defines delivery order.

The latest decisions are recorded: attempts are created only on whole-test submission; no answers are persisted before submission; author drafts save explicitly; copies are independent; topic block propagation uses the same moderation case; guest retry capabilities use the agreed ticket/HMAC protocol; visible text is counted after shared extraction; only matching's right side is shuffled. Groups, questions and all other options preserve author order.

This reconciliation found no additional product question requiring an answer before the first increment. Remaining technical work is listed below; its completion must be supported by implementation checks, not further approval of already-agreed behavior.

## Completed first increment

1. Merge the [25-model fragment](proposals/learning-models.prisma) and [User inverse relations](proposals/user-relations.prisma.fragment) into `backend/prisma/schema.prisma`.
2. Create one new additive migration under `backend/prisma/migrations/` from the reviewed [forward SQL](proposals/forward.sql), preserving SQL-managed compound foreign keys, deferred ordering constraints, checks and partial indexes. Do not edit existing migrations. No existing User columns or backfill are required.
3. Generate Prisma Client and verify the migration against an isolated baseline built from project migration history. Keep the module unavailable to users until its authorization, account-deletion and cleanup paths are integrated.
4. Add the following exact backend packages and update `pnpm-lock.yaml`. Implement the Learning domain/application foundation and GraphQL/session adapters through the existing architecture, beginning with the standalone single-choice flow.

| Package                           | Placement                                | Purpose                                   |
| --------------------------------- | ---------------------------------------- | ----------------------------------------- |
| `@nestjs/graphql@13.4.5`          | backend dependency                       | Code-first Nest GraphQL transport         |
| `@nestjs/apollo@13.4.5`           | backend dependency                       | Nest Apollo driver                        |
| `@apollo/server@5.5.1`            | backend dependency                       | GraphQL execution                         |
| `@as-integrations/express5@1.1.2` | backend dependency                       | Existing Express 5 integration            |
| `graphql@16.14.2`                 | backend dependency                       | Compatible GraphQL runtime                |
| `zod@4.4.3`                       | backend dependency                       | Decode unknown versioned content payloads |
| `@types/express@5.0.6`            | replace backend dev dependency `4.17.17` | Align types with existing Express `5.2.1` |

All listed packages declare MIT in registry metadata checked on 2026-10-13. Direct peers match the repository's Nest 11/Express 5 family; Apollo and the Express integration require Node >=20. This is metadata evidence, not proof of a successful install/build. Justification, alternatives and bundle implications are in the [dependency proposal](SCHEMA-AND-DEPENDENCIES-learning.md#backend-runtime). DataLoader is not part of this initial installation; add it only for a demonstrated resolver query path.

Approval of this change set covers repository schema/migration files, these dependency edits and isolated validation. Applying migrations to an application database, running the administrator seed, deployment and storage/CI infrastructure changes require their own scoped authorization. The [empty-only reversal](proposals/rollback-empty-only.sql) must never be used to remove populated Learning data.

## Frontend package preparation

The exact proposed code-generation and Tiptap versions remain in the [dependency proposal](SCHEMA-AND-DEPENDENCIES-learning.md#frontend-generation-and-transport). They are scheduled for the frontend increment, rather than installed during the backend foundation. Use existing fetch/session handling and TanStack Query; load Tiptap only in author routes. There is no Apollo Client or second cache in the proposed set.

A verified environment mismatch must be resolved before installing the proposed Codegen CLI: local Node is `22.12.0`, but CLI `7.4.5` depends on `listr2 ^10.2.1` and `@inquirer/prompts ^8.3.2`, whose checked versions require at least Node `22.13.0` on the Node 22 line. The CLI's own `node >=16` declaration is insufficient evidence of compatibility. See [listr2 metadata](https://registry.npmjs.org/listr2/10.2.1) and [prompts metadata](https://registry.npmjs.org/@inquirer%2fprompts/8.3.2).

Recommendation: use an approved supported Node 22 patch satisfying the resolved dependency graph, then validate the actual lockfile/install and code generation. Do not suppress engine checks or silently change the user's runtime/CI. Dockerfiles currently use the floating `node:22-alpine` tag, which does not establish the local or CI patch version. Frontend installation/environment changes are outside the first backend change set.

## Remaining engineering work

| Area                    | Work to complete within implementation                                                                 | Required evidence                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Persistence             | Preserve SQL-only constraints; integrate account deletion before enabling Learning writes              | Migration-history baseline, schema/client checks, isolated PostgreSQL constraints and rollback  |
| Question/documents      | Typed bounded schemas, approved text extraction and scoring, allowlisted player projections            | Unit cases for Unicode, invalid IDs, limits, incomplete drafts and answer-key exclusion         |
| GraphQL/session         | Same-origin adapter, explicit auth/error mapping, CSRF, per-operation authorization and request limits | Guest/auth/session-expiry tests and existing REST regressions                                   |
| Opening/submit          | Atomic opening/receipt and attempt/receipt writes, HMAC derivation, expiry and key rotation            | Lost-response replay, changed-payload conflict, concurrent submits and deadline boundaries      |
| Authoring/publication   | Explicit save, revision conflicts and coherent immutable publication                                   | Save/publish races and first browser author-to-result flow                                      |
| Views                   | Per-opening operation identity, atomic retry deduplication, preview/prefetch/bot exclusions            | Reload counts again; same-opening retry counts once; topic/exercise counters remain independent |
| Topics/media/moderation | Independent copies/references, protected delivery and coordinated block/delete/cleanup                 | Concurrent copy/block/cleanup, retained copies, role freshness and no staff draft access        |

Remaining numerical defensive limits in schema-proposal section 14 are engineering proposals, not additional product features. Verify them against the largest valid payload before adopting them: visible grapheme count is not a UTF-8 byte bound, so maximum combining sequences/escaping may hit a separate request-size limit first. Never silently truncate or claim every valid answer snapshot fits an unmeasured transport budget.

## Evidence and first usable outcome

The [PostgreSQL report](proposals/POSTGRES-VERIFICATION.md) records earlier isolated checks and their limits. It is historical evidence, not a new run from this documentation reconciliation. Current SQL/model artifacts were not modified in this pass. No Learning runtime, browser flow, new dependency build or deployment is claimed complete.

The first usable outcome remains: create a standalone single-choice test, explicitly save and publish it, open it as a learner, submit the whole test and receive its result. Then add remaining question types, topics/copies/images and platform moderation under the same invariants. The complete v1 still includes those later increments.
