# Learning — concrete database change proposal

Status: reference proposal. The approved model and SQL were copied into the runtime schema and the new migration. These files remain a review/reference snapshot; the temporary PostgreSQL validation database was disposed of. No project/application database, seed or deployment was used.

- [Prisma model fragment](learning-models.prisma): 25 new models.
- [User inverse-relation fragment](user-relations.prisma.fragment): relation fields only; no new existing-user columns.
- [Forward SQL](forward.sql): additive table/index/FK creation plus SQL-managed invariants.
- [Empty-only reversal](rollback-empty-only.sql): locks all 25 tables before checking emptiness and refuses rollback if any contains data; no cascading drop of existing tables.
- [Design rationale and approved policies](../SCHEMA-AND-DEPENDENCIES-learning.md#14-consolidated-implementation-proposal--2026-10-12).

## How this proposal was prepared

Combined the existing `backend/prisma/schema.prisma`, the new User inverse fields and the model fragment into a temporary schema outside the repository. The installed Prisma CLI validated that combined datamodel. Generated SQL using schema-to-schema `prisma migrate diff --from-schema <existing> --to-schema <temporary> --script`, not a live database source. Added named PostgreSQL checks, compound FKs, deferred ordering constraints and public-catalog partial indexes for policies the Prisma datamodel does not express.

A standalone model fragment intentionally lacks datasource/generator/User definitions; validate the combined schema, not the fragment alone. The combined client was generated after integration into the runtime schema.

## Important refinements

- Opening leases store identity/version/presentation and a capability hash only, never answers. Completed attempts are inserted only upon successful submit. There is no active-attempt uniqueness, answer-save endpoint or 14-day unfinished retention.
- A completed row references its opening; retain the minimal opening while its result/receipt needs that identity even after the opening's submission deadline. Expired opening authorization never becomes valid because the row remains retained. Clean attempts before eligible opening rows.
- `principalKey`/`actorKey` are opaque identity values rather than profile snapshots. On account deletion revoke openings and mark attempts erased before the existing User FK is set null. Result reads deny erased accounts immediately; hourly cleanup removes their answer bodies. This integration is required before exposing account deletion with these new relations.
- Current-version pointers, exact test/version associations, topic owner/membership and same-root provenance include compound FKs in SQL. Some are intentionally SQL-managed rather than duplicate Prisma relations with overlapping scalar fields. Prisma validation alone does not prove these SQL invariants.
- Ordering uniqueness is deferred until commit to support atomic position swaps. SQL checks protect nonnegative positions/revisions, known discriminators, principal modes, one media parent and exact 24-hour/3-day/12-hour deadlines. Rich-document/answer semantics remain typed application validation.
- Catalog `publishedAt` means first publication. Subsequent publication changes never renew it. Titles/descriptions/optional English levels live in saved drafts and immutable versions. Both topics and tests have independent counters.
- Evidence has a real FK to the retained published test/topic version. Restriction targets survive owner deletion and topic detachment. Audit events retain opaque actor identity independently of the optional User FK. Case/evidence timing and last-admin concurrency require application transactions; no cross-table CHECK pretends to enforce them.
- SQL-managed constraints/indexes must be retained when preparing the actual migration and checked for drift in future migrations. Deferrable constraints replace the corresponding immediate Prisma-generated unique indexes; do not blindly regenerate SQL and lose that behavior.

## Empty-only rollback concurrency

The rollback starts its own READ COMMITTED transaction and obtains ACCESS EXCLUSIVE locks on all 25 tables in a fixed order before any emptiness check. These locks remain held through DROP and commit. A writer that committed before lock acquisition is visible to the subsequent check; a later writer cannot insert between the check and DROP. Lock timeout or a nonempty table aborts the transaction without dropping tables. Run this as a standalone transaction, not inside a caller's existing transaction/snapshot.

Required isolated PostgreSQL regression: hold an uncommitted INSERT in one connection, start rollback in another, then commit the writer before the lock timeout. Rollback must acquire the lock, observe the row and fail with the populated-table error while preserving all tables/data. Also verify lock timeout preserves tables, empty rollback succeeds, and writes started after rollback has acquired all locks cannot commit into tables being dropped. These concurrency scenarios passed in the authorized isolated PostgreSQL run; see the [verification report](POSTGRES-VERIFICATION.md).

## Guest capability replay protocol

Product and transport behavior are agreed; implementation and security verification remain future work. A signed, short-lived operation ticket binds the principal, operation, resource, nonce, canonical payload hash, issue time, admission deadline and versioned server key. Derive the guest opening capability with domain-separated HMAC over opening ID and ticket nonce. Derive the post-submit result capability with a separate HMAC domain over attempt ID and submit-ticket nonce. Persist only capability hashes and minimal receipt outcome identifiers; never store raw capabilities.

A retry with the same still-authorized ticket derives and returns the same capability/outcome. A different ticket cannot recover it, and a freely supplied resource ID is never enough. A changed payload under the same operation identity conflicts. Tickets admit an operation for 12 hours; a committed receipt permits an authorized replay for 12 hours from commit, including after ticket admission ends. If admission expires without a receipt, or the receipt has expired, reject without re-executing the operation. Replays do not extend either deadline. Retain each signing key through the admission and receipt replay windows of tickets issued with it. Keep capabilities only in current page memory; never URL, logs, localStorage or sessionStorage. Closing/reloading the page therefore loses guest result access. Schema validation does not prove ticket isolation, HMAC derivation, timing enforcement or authorization; these need focused transport/application tests.

## Validation and remaining evidence

Datamodel validation, temporary Prisma Client generation and additive schema-to-schema diff comparison passed without database access. The fresh diff's 25 table definitions match the proposal's table columns and primary keys; it does not modify the existing `User` table. Static inspection confirms all created objects belong to Learning/platform authority. Existing application checks are regression evidence only.

The parity audit found and fixed a schema gap: attempts now reference the exact `(opening, principal kind, principal key)` tuple. Prisma validation/client generation, fresh diff comparison and isolated PostgreSQL checks cover matching and mismatched principals, including coordinated account erasure. Transaction-level application obligations are recorded in the [verification report](POSTGRES-VERIFICATION.md).

**Passed on isolated PostgreSQL 15.19:** forward/empty rollback/reapply, populated refusal, three rollback concurrency cases and selected FK/ordering/expiry/principal/account-deletion constraints: [29-check report](POSTGRES-VERIFICATION.md).

**Not run:** project migration-history drift checks, full application concurrency/retention integration, application build with new dependencies, seed, browser Learning flows or deployment. No dependency was installed.

Before an actual migration, complete drift/client checks and application-level concurrent publish/copy/block/cleanup verification. Repeat the isolated SQL checks if the proposal changes. A populated deployment must roll back code/routes while retaining data, not run the empty-only reversal. Never use these SQL files against a user database as part of review.

## Proposed next step

See the [implementation handoff](../IMPLEMENTATION-HANDOFF-learning.md) for the exact first change set. Frontend Codegen installation has a verified local Node patch incompatibility and is deferred until that environment prerequisite is resolved.

The first approved schema/dependency increment has been transferred into the runtime Prisma schema and an additive migration, and the exact backend package set is installed. Preserve existing organization roles and REST behavior. Seed execution, deployment and any storage/scheduler infrastructure changes retain their separate authorization requirements.
