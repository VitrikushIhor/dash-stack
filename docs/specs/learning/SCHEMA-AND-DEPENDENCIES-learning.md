# Learning — Schema and Dependency Proposal

- Date: 2026-10-09
- Status: Proposed for review; no schema, migration, dependency, or infrastructure changes applied
- Product baseline: [Feature specification](FEATURE-SPEC-learning.md)
- Architecture: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Delivery sequence: [Implementation plan](IMPLEMENTATION-PLAN-learning.md)
- Payload proposal: [Question, answer and result contracts](QUESTION-CONTRACTS-learning.md)
- Repository inspected: `dev`, `07a6253c`; existing staged documentation is preserved

## 1. Review boundary

This is a concrete relational design and a proposed package list. Table/column names below are proposed database names; they are not existing APIs. The final Prisma definitions and additive SQL migrations require separate review. The specification now fixes authenticated retention at 14 days for unfinished attempts and 3 days for completed results, guest use until page closure, first-administrator assignment through seed, and content/image limits. O-01–O-10 tracks remaining details; nullable expiry fields do not imply unlimited retention.

Preserve current NestJS/Prisma/PostgreSQL, authentication, organization roles, REST routes, and Vocabulary models. Add fixed platform permissions independently. Do not bootstrap privileged users from public registration or infer platform rights from an organization role.

## 2. Common storage conventions

- New IDs: Prisma `String` / PostgreSQL `text`, generated with the existing `cuid()` convention. No new ID library.
- Dates: Prisma `DateTime @db.Timestamptz(3)`; existing timestamp columns are not migrated as part of this module.
- Revisions and ordering: nonnegative `Int`; revisions increment on accepted changes. Question/group IDs are stable within one test and remapped when copying to another test.
- Payloads: Prisma `Json` / PostgreSQL `jsonb` for bounded, discriminated question/rich-text/answer data, with schema versions and runtime validation. Ownership, ordering, provenance, and lifecycle links remain relational.
- Fixed state values: proposed `text` columns with named SQL `CHECK` constraints and matching TypeScript `as const`/discriminated unions. This avoids creating PostgreSQL enums solely for application branching. Changes to allowed states require a reviewed migration.
- `FK` means an actual foreign key, not a string convention. `?` means nullable. Ordinary parent/content FK deletion defaults to `RESTRICT` unless explicitly described otherwise.
- Retained immutable versions are application-immutable. Repository APIs must not expose arbitrary version updates; enforce this with tests. Physical deletion is restricted to authorized retention cleanup, not ordinary editing.

## 3. Resource identities and ownership

### `learning_topics`

| Column                                   | Type / constraint                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `id`                                     | `text`, primary key                                                    |
| `owner_user_id`                          | `text?`, FK to `User.id`, `ON DELETE SET NULL`                         |
| `visibility`                             | `PRIVATE`, `UNLISTED`, or `PUBLIC`, default `PRIVATE`                  |
| `current_version_id`                     | `text?`, same-topic version FK                                         |
| `access_revision`                        | `integer`, default 0; changed by visibility/block/delete operations    |
| `published_at`                           | `timestamptz?`, ordering projection maintained on publication          |
| `created_at`, `updated_at`, `deleted_at` | Timestamps; only deletion is nullable among creation/update timestamps |

### `learning_tests`

| Column                                   | Type / constraint                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`                                     | `text`, primary key                                                                      |
| `owner_user_id`                          | `text?`, FK to `User.id`, `ON DELETE SET NULL`                                           |
| `topic_id`                               | `text?`, same-owner topic FK; null for standalone tests                                  |
| `visibility`                             | `PRIVATE`, `UNLISTED`, or `PUBLIC` for standalone tests; null for embedded exercises     |
| `current_version_id`                     | `text?`, same-test version FK                                                            |
| `lineage_id`                             | `text`, unique FK to retained lineage node                                               |
| `access_revision`                        | `integer`, default 0                                                                     |
| `page_open_count`                        | `bigint`, default 0, nonnegative; serialize as decimal string if exposed through GraphQL |
| `published_at`                           | `timestamptz?`                                                                           |
| `created_at`, `updated_at`, `deleted_at` | As above                                                                                 |

Required checks: a live resource has an owner; `topic_id IS NULL` exactly when `visibility IS NOT NULL`. Add `UNIQUE(id, owner_user_id)` to topic and test identities where needed by compound ownership FKs. A test's `(topic_id, owner_user_id)` references `(learning_topics.id, owner_user_id)`; a separate simple topic FK ensures topic existence even after owner anonymization. No ownership transfers are introduced in v1.

`ON DELETE SET NULL` does not implement account deletion alone. Before removing a user, the account deletion transaction marks their Learning resources deleted and invalidates access. A check `owner_user_id IS NOT NULL OR deleted_at IS NOT NULL` rejects an uncoordinated deletion instead of leaving live ownerless resources. Both deletion ordering and existing account flows require integration tests before this FK is deployed.

Keep a minimal identity tombstone while versions, moderation, or attempts need it. Do not cascade account deletion through independently owned copies. Title/description live in draft and version records; catalog reads join the current version, never the mutable draft.

## 4. Editable and published test content

Use separate draft and version tables so editing cannot accidentally update a publication. All editable text below defaults to empty valid draft data; publication applies stricter rules.

| Table                             | Columns and keys                                                                                                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `learning_test_drafts`            | `test_id` PK/FK, `revision integer`, `title text`, `description jsonb`, `schema_version integer`, `updated_at`                                                                                                   |
| `learning_test_draft_groups`      | `(test_id, group_key)` PK, `position integer`, `title text`, `instruction jsonb`, `material jsonb`; FK to draft                                                                                                  |
| `learning_test_draft_questions`   | `(test_id, question_key)` PK, `group_key`, `position`, `kind text`, `prompt jsonb`, `configuration jsonb`, `solution jsonb`, `explanation jsonb`; compound FK to its group                                       |
| `learning_test_versions`          | `id` PK, `test_id` FK, `version_number integer`, `title`, `description`, `schema_version`, `scoring_version integer`, `max_points integer`, `created_at`; unique `(test_id, version_number)` and `(test_id, id)` |
| `learning_test_version_groups`    | `(version_id, group_key)` PK, `position`, `title`, `instruction`, `material`; FK to version                                                                                                                      |
| `learning_test_version_questions` | `(version_id, question_key)` PK, `group_key`, `position`, `kind`, `prompt`, `configuration`, `solution`, `explanation`, `max_points`; compound FK to its version/group                                           |

A question without visible grouping uses a default group with optional empty material; no orphan group-less question shape. Enforce unique group position per draft/version and unique question position per group. Use deferred unique ordering constraints in reviewed SQL, or a fully specified collision-free reordering protocol; do not rely on arbitrary sequential position updates.

Question kinds: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT`, `GAPS`, `MATCHING`. `GAPS` contains typed per-gap modes. Partial/incomplete `solution` values are valid only in drafts.

The question contract proposal specifies the discriminated configuration/solution shapes and publication refinements. Matching uses equal left/right collections and a bijective solution without extra choices. Pin normalization/evaluation through `scoring_version`; text preserves internal whitespace/punctuation/apostrophe distinctions, and results retain exact points with a whole-number percentage display. Remaining Unicode and publication validation choices must be resolved before implementing the decoders/evaluators.

The `configuration` column contains learner-visible structure; `solution` contains keys. For matching, configuration holds independent left/right elements, while solution holds mappings. For gaps, prompt nodes reference gap IDs and configuration holds input modes/options; acceptable answers belong in solution. Validation ensures IDs are unique and references remain within the question. Column separation reduces accidental disclosure but does not replace allowlisted player projection.

Rich text uses an application-owned, versioned allowlist of nodes/marks. Tiptap is an authoring adapter, not a backend dependency. Represent media with asset IDs and gaps with gap IDs; reject raw scripts, arbitrary node attributes and unvalidated external image URLs. The renderer emits safe React elements and validated links, not arbitrary stored HTML.

Do not create one table per option type in v1: bounded options are read and versioned with the question. Do not introduce a generic unvalidated `JSON` field in the public GraphQL contract just because persistence uses JSONB.

## 5. Topic drafts and publications

| Table                              | Columns and keys                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `learning_topic_drafts`            | `topic_id` PK/FK, `revision integer`, `title text`, `description jsonb`, `materials jsonb`, `schema_version integer`, `updated_at`                                      |
| `learning_topic_draft_exercises`   | `topic_id` FK to draft, `test_id` unique, `position`; PK `(topic_id, test_id)`                                                                                          |
| `learning_topic_versions`          | `id` PK, `topic_id` FK, `version_number`, `title`, `description`, `materials`, `schema_version`, `created_at`; unique `(topic_id, version_number)` and `(topic_id, id)` |
| `learning_topic_version_exercises` | `topic_version_id`, `test_id`, `test_version_id`, `position`; PK `(topic_version_id, test_id)`; compound FK `(test_id, test_version_id)` to test version                |

Draft exercise membership references `(learning_tests.topic_id, learning_tests.id)` through a matching unique constraint. This prevents a draft attaching an unrelated standalone test; adding an existing test must first create a topic-owned copy. Deleting draft membership leaves `learning_tests.topic_id` unchanged until removal is published. That distinction preserves current access while removal is pending.

Historical topic-version membership must NOT FK to the test's mutable `topic_id`: detachment must leave old publications structurally intact. Validate same-topic ownership during publication inside the transaction, and retain only the immutable test/version association in historical rows.

Each exercise save updates the parent topic draft revision. Topic publication locks/rechecks that revision, validates all included content, creates/reuses exact test versions, switches publication pointers, detaches removed copies, and records its idempotency receipt in the same transaction. Detachment sets `topic_id = NULL` and `visibility = PRIVATE` together.

Same-resource publication FK examples (proposal only, not executed):

```sql
ALTER TABLE learning_tests
  ADD CONSTRAINT learning_test_current_version_fk
  FOREIGN KEY (id, current_version_id)
  REFERENCES learning_test_versions (test_id, id)
  ON DELETE RESTRICT;

ALTER TABLE learning_topics
  ADD CONSTRAINT learning_topic_current_version_fk
  FOREIGN KEY (id, current_version_id)
  REFERENCES learning_topic_versions (topic_id, id)
  ON DELETE RESTRICT;
```

The current pointer is null at creation. Insert a version before setting its pointer. Before physical cleanup, clear pointers only in an authorized deletion transaction. Whether these compound relations can be represented cleanly in the installed Prisma version must be verified in the migration draft; PostgreSQL remains responsible for the invariant.

## 6. Attempts and operation receipts

### `learning_guest_sessions`

`id text PK`, `credential_hash text UNIQUE`, `created_at`, `expires_at`, `revoked_at?`. Generate credentials using platform crypto and keep only a hash. This is a guest capability for the current open Learning page, not a new user account or a recoverable browser profile. Do not persist a recovery credential that restores the attempt after page closure. Browser-close notifications cannot guarantee immediate backend deletion; bounded server expiry cleans abandoned guest state. Its numeric duration, capability delivery and reload/navigation details remain O-02. The authenticated 14-day/3-day windows do not enable guest recovery. Never log or expose credential hashes.

### `learning_test_attempts`

`id text PK`, `test_id`, `test_version_id`, `user_id? FK`, `guest_session_id? FK`, `status text`, `revision integer`, `answers jsonb`, `presentation jsonb`, `result jsonb?`, `started_at`, `updated_at`, `last_activity_at`, `submitted_at?`, `expires_at`.

- Exactly one principal: registered user or guest session, enforced with `CHECK`.
- Composite `(test_id, test_version_id)` FK ensures the version belongs to the test.
- Status: `ACTIVE`, `SUBMITTED`, `SUPERSEDED`, `EXPIRED`; access denial is derived from current policy, not a new destructive state. `EXPIRED` can serve as a minimal tombstone while answers/results are cleared under the cleanup policy.
- `presentation` fixes option ordering for this attempt; no answer-key mappings appear there.
- `answers` is bounded, schema-validated and keyed by question/gap/option identity in the chosen version.
- `result` is written once during submission and replayed safely; it is not a public result-history API.
- For authenticated `ACTIVE` attempts, `expires_at = last_activity_at + 14 days`. For authenticated `SUBMITTED` attempts, `expires_at = submitted_at + 3 days`. Require the corresponding dates, and do not extend completed expiry on reads/retries. Define the qualifying user-activity signal under O-01; `updated_at` alone is unsuitable because background maintenance can update a row without user activity.
- Enforce expiry on read/save/submit even before cleanup. Under the same start/restart transaction, retire an expired active row before creating its replacement. Clear expired answers/results without deleting versions or assets still retained by other valid references. Guest `expires_at` uses the separate technical policy pending O-02.
- User/guest principal deletion uses explicit retention workflow and restrictive FKs for this proposal. Do not `SET NULL` and accidentally turn a registered attempt into a guest attempt. Account deletion must erase or anonymize attempt data under O-01 before deleting the principal; this is a deployment gate.

Enforce one active authenticated attempt per test with an SQL partial unique index:

```sql
CREATE UNIQUE INDEX learning_attempt_one_active_user_test
  ON learning_test_attempts (user_id, test_id)
  WHERE status = 'ACTIVE' AND user_id IS NOT NULL;
```

There is no volatile `now()` predicate in the index. Expired/superseded state changes occur through an explicit transition; an expired `ACTIVE` row cannot strand the user until a scheduled cleanup. Restart and submit are transactional, preventing concurrent submit/restart from overwriting completed results. Uniqueness applies across devices.

### `learning_operation_receipts`

`id text PK`, `user_id? FK`, `guest_session_id? FK`, `operation_name text`, `operation_id text`, `payload_hash text`, `outcome jsonb`, `created_at`, `expires_at?`. Exactly one principal, with separate unique constraints for `(user_id, operation_name, operation_id)` and `(guest_session_id, operation_name, operation_id)`.

Store minimal versioned outcomes/IDs rather than an unrestricted copy of private content. A receipt is committed with its business mutation. Replaying it still checks current session, role, resource access, blocking, deletion and result expiry before returning protected data. Otherwise an old success receipt would bypass immediate revocation or keep an expired result available. A different payload with the same operation key conflicts. Authenticated submission receipts must support reliable replay within the agreed three-day result window, without extending or duplicating result retention. Minimal deduplication tombstone lifetimes and other operation receipt lifetimes remain O-01; they must not retain expired answer/result bodies.

## 7. Provenance and copying consistency

### `learning_test_lineage`

`id text PK`, `parent_id text?`, `root_id text`, `tree_revision integer`, `created_at`; unique `(id, root_id)`. Each test has exactly one node. A root has `parent_id = NULL` and `root_id = id`; a copied node references its parent in the same root using a compound FK. Parent/root links are immutable. Retain these minimal non-content nodes independently of source owner/content deletion.

Use a recursive PostgreSQL query over indexed parent links for descendant discovery, not one query per child. Start with an adjacency tree; no closure-table storage or graph dependency. Disallow reparenting and cyclic updates at the repository boundary; insert children only under an existing locked parent. Define a bounded moderation workload and fail explicitly if it exceeds the approved v1 limit rather than partially applying a block.

Proposed race protocol: copy and lineage-block mutations first lock the lineage root row. Copies check current source authorization and all effective restrictions, create the new node/resource/media references, increment root `tree_revision`, and commit. A moderation preview returns revision plus safe scope information; confirmation rejects a changed revision and requires a refreshed preview. A successful block and copy cannot interleave into an unblocked escaped descendant. This serializes rare tree mutations while leaving ordinary reads outside the root lock.

An individual block also participates in the copy consistency protocol. Topic access/blocks must be checked under the relevant topic/test locks when copying embedded resources. Lock order is root (when needed), topics, tests, attempts, assets; sort IDs within a category. Other operations cannot acquire these in reverse order. Exact SQL and race tests are required before approval of the migration/adapter implementation.

## 8. Media with typed uses

### `learning_media_assets`

`id text PK`, `storage_key text UNIQUE`, `uploader_user_id? FK ON DELETE SET NULL`, `mime_type text`, `byte_size bigint`, `width integer?`, `height integer?`, `state text`, `created_at`, `deletion_claimed_at?`, `lease_expires_at?`.

States: `UPLOADING`, `READY`, `DELETING`; failed/abandoned uploads follow a cleanup policy rather than pretending publication succeeded. The uploader is attribution, not lifetime ownership. Store bytes in protected Learning storage using existing local/S3 transport capabilities through a new authorized adapter. Do not change existing public Vocabulary images as collateral work.

### `learning_media_uses`

`id text PK`, `asset_id FK`, and exactly one of `test_draft_id?`, `test_version_id?`, `topic_draft_id?`, `topic_version_id?`, each with a real FK to its containing record. Use four unique asset/parent pairs (null pairs are allowed), and an exactly-one-parent SQL check. No generic `(ownerType, ownerId)` without referential integrity.

Uses are at content-container granularity: repeated use of one image in several questions requires one retention link for that container. Captions and placement belong to the rich-text document, not to the shared asset. The server derives uses from validated documents and rejects unauthorized asset attachments; do not trust a client-supplied retention list.

To collect an asset, lock it, recheck there are no live uses and no valid upload lease, set `DELETING`, then commit. Reference creators lock the same asset and accept only `READY`; they cannot attach a deletion-claimed object. Physical deletion happens after commit with a retryable outcome. On failure, keep deletion state rather than reopening it for attachment. A crashed collector can resume. An unreferenced-upload lease is bounded by the later approved policy.

Delivery authenticates a specific currently authorized use and returns protected bytes. A shared asset cannot authorize access merely because a caller knows its ID. Public topic publication does not make every future private use permanently public. Image upload uses a dedicated authenticated HTTP/storage endpoint and returns an asset ID to GraphQL; no multipart-GraphQL package is proposed.

## 9. Platform authority and moderation records

### `platform_role_assignments`

`user_id text PK/FK`, `role text CHECK (MODERATOR|SENIOR_MODERATOR|PLATFORM_ADMIN)`, `assigned_by_user_id? FK SET NULL`, `assigned_at`, `revision integer`. One effective graded role per user; absence means no platform privileges. A fixed permission map grants lower-grade capabilities explicitly. No role arrays or generic permission-editor schema in v1.

Read role state freshly for privileged operations. Revocation must not wait for an access token to expire. Role assignment and audit must commit atomically. The first platform administrator is explicitly assigned through seed to a configured account. Organization ownership and ordinary demo-data seeding do not confer that role. Make bootstrap idempotent and prevent ordinary reruns from silently restoring revoked privileges. Account selection, rerun/revocation safeguards, last-admin protection and self-role changes remain O-03; no seed is run by this proposal.

### `learning_moderation_cases`

`id PK`, `scope text (TEST|TEST_LINEAGE|TOPIC)`, `root_lineage_id? FK`, `topic_id? FK`, `reason text`, `opened_by_user_id? FK SET NULL`, `opened_at`, `scope_revision? integer`, `state text (OPEN|CLOSED)`. Exactly one appropriate root target for the scope. Bounded reason strings contain no content dumps.

### `learning_test_restrictions` and `learning_topic_restrictions`

Test restrictions: `(case_id, lineage_id)` PK/FKs, `applied_at`, `lifted_at?`, `lifted_by_user_id?`, `lift_reason?`. Use lineage identities so ordinary source content removal does not erase restrictions/provenance.

Topic restrictions: `(case_id, topic_id)` PK/FKs, the same lifecycle fields. Topic identity tombstones remain while cases need them. Effective test access denies any active own restriction or active parent-topic restriction. One case may have many targets; lifting a target does not clear another case. Case closure requires no active target restrictions.

Lineage-wide action can include private descendants without granting a senior moderator their content. The exact safe count/metadata preview is an O-07 gate. Both author APIs and media delivery deny blocked content. Only an authorized moderation review pathway may retrieve it; administrators must provide a reason for private content review.

### `platform_audit_events`

`id PK`, `actor_user_id? FK SET NULL`, `action text`, `target_kind text`, `target_id text`, `reason text`, `request_id text`, `occurred_at`, `details jsonb` with a strict allowlist. Audit target identity is intentionally an immutable event value rather than a cascading content FK. This preserves evidence after a target is removed; it is not used to authorize resource loading.

Record private review authorization, block/unblock/delete, and role changes. Do not retain names, emails, tokens, private document bodies or learner answers in `details`. Subject identifiers and retention require O-07/O-08 decisions. A denied privileged action must not accidentally return content if its audit write fails.

## 10. Constraints, access paths, and deletion order

PostgreSQL supports partial unique indexes and composite FKs. Cross-table conditions must not be hidden inside `CHECK` expressions: use actual FKs or transactionally verified invariants. Custom database features require reviewed SQL where the installed Prisma version cannot express them. See [PostgreSQL constraints](https://www.postgresql.org/docs/15/ddl-constraints.html) and [Prisma custom database features](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/unsupported-database-features).

| Access path                  | Proposed supporting index                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner library                | Tests/topics `(owner_user_id, updated_at DESC, id)`                                                                                          |
| Public catalog               | Partial index on `(published_at DESC, id)` for public, published, nondeleted standalone tests/topics; restriction checks remain required     |
| Exercise composition         | Unique `(parent_id, position)` for each draft/version composition                                                                            |
| Resource/version association | Unique `(test_id, id)` or `(topic_id, id)` on versions                                                                                       |
| Latest active attempt        | Partial unique user/test index plus `(guest_session_id, test_id)` for guest lookups                                                          |
| Attempt retention            | `(expires_at, id)` plus status filtering and indexed version FK; deadlines use `last_activity_at` or `submitted_at`, not maintenance updates |
| Descendant discovery         | `(parent_id, id)` and `(root_id, id)`                                                                                                        |
| Effective restrictions       | Partial `(lineage_id)` / `(topic_id)` where `lifted_at IS NULL`; separate case-target keys                                                   |
| Media cleanup                | `(state, created_at, id)` plus `asset_id` and parent indexes on uses                                                                         |
| Receipt expiry               | `(expires_at, id)`                                                                                                                           |
| Moderation audit             | `(occurred_at, id)`, `(actor_user_id, occurred_at)` and `(target_kind, target_id, occurred_at)`                                              |

Do not add broad JSONB GIN indexes until a concrete query uses JSON predicates. Catalog filter indexes follow the still-open metadata contract. PostgreSQL does not automatically index every referencing FK; include the required reference/deletion lookup indexes in migration review.

Apply the agreed configuration limits to all write/copy/duplicate paths: 100 questions and 20 groups per test; 10 options per choice question/selectable gap; 20 gaps or matching pairs per question; 50 exercises per topic. Validate each image input at no more than 5 MiB (5,242,880 bytes), with JPEG/PNG/WebP content. These are configurable application-boundary limits, not cross-row `CHECK` subqueries. Check aggregate counts under the parent's mutation lock so concurrent additions cannot exceed the limit. Additional text/pixel-count/image-count/request limits remain O-04.

Physical cleanup must first establish no live current pointer, active/retained attempt, or retained topic version needs a test version. Remove eligible topic-version exercise links before test versions; remove child questions/groups and media uses with their eligible container. Only then can unreferenced assets be claimed for deletion. Provenance and audit follow their own approved retention, not content cascades.

Topic deletion's keep/delete choice operates on all owned membership, including unpublished and pending-removal copies. A former exercise already detached by a completed publication is no longer a current member and is not deleted again. Publication/removal locks prevent it escaping or joining the deletion set midway. Independent copies elsewhere are unaffected. Logical deletion denies access immediately even when retained evidence prevents physical cleanup.

## 11. Dependency proposal and evidence

Registry metadata and official documentation were checked on 2026-10-09. Version compatibility below is based on declared peer ranges and the inspected repository, not an installation/build proof. Pin initial candidates exactly when approved, retain the lockfile, and recheck advisories and transitive licenses before installation. No package was installed for this proposal.

The installed local tree currently resolves Nest common/platform-express `11.2.1`, Prisma client `7.9.1`, React `19.x`, and Zod `4.4.3`; package manifests express ranges. Node is `22.12.0`; container definitions use Node 22 and PostgreSQL 15. Reverify the target deployment rather than treating a local resolution as a production guarantee.

### Backend runtime

| Package / proposed version        | Purpose and alternative                                                                                                           | License / impact / maintenance evidence                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nestjs/graphql@13.4.5`          | Nest GraphQL integration, code-first transport types; alternative: hand-written Apollo integration with extra Nest lifecycle work | MIT; server-only; Nest-maintained line with Nest 11 peers                                                                                                     |
| `@nestjs/apollo@13.4.5`           | Official Apollo driver; alternative Mercurius requires changing the current Express adapter                                       | MIT; server-only; same maintained integration family                                                                                                          |
| `@apollo/server@5.5.1`            | GraphQL execution/server lifecycle; required by chosen driver                                                                     | MIT; server-only; Apollo-maintained, Node >=20                                                                                                                |
| `@as-integrations/express5@1.1.2` | Bind Apollo to existing Express 5                                                                                                 | MIT; server-only; Apollo integrations project; inspect release/issue health again before install                                                              |
| `graphql@16.14.2`                 | Runtime schema/validation required by server and integrations                                                                     | MIT; server-only in backend; GraphQL.js project                                                                                                               |
| `zod@4.4.3`                       | Validate versioned discriminated JSON from Prisma and content boundaries, aligned with already-resolved frontend version          | MIT; no new browser copy; alternative: reuse class-validator for transport and hand-write every nested unknown-data validator                                 |
| `dataloader@2.2.3`                | Add when nested independent resolvers require request-scoped batching                                                             | MIT; server-only; mature GraphQL project, older release alone is not evidence of abandonment; alternative: one explicit batched query for bounded read models |

DataLoader is conditional on a concrete resolver query path, not required for every repository call. Never share its authorization-sensitive cache globally. See [DataLoader guidance](https://github.com/graphql/dataloader).

Choose Nest GraphQL 13 deliberately: registry metadata for current 14.0.3 requires Nest 12. Also use GraphQL 16 deliberately: Apollo Server 5.5.1 declares `^16.11.0`, so a blind install of current GraphQL 17 is not this compatible set. Evidence: [Nest GraphQL 13.4.5 metadata](https://registry.npmjs.org/@nestjs%2fgraphql/13.4.5), [Apollo driver 13.4.5 metadata](https://registry.npmjs.org/@nestjs%2fapollo/13.4.5), [Nest GraphQL 14 metadata](https://registry.npmjs.org/@nestjs%2fgraphql/14.0.3), and [Apollo Server metadata](https://registry.npmjs.org/@apollo%2fserver/5.5.1).

The official [Nest integration guide](https://docs.nestjs.com/graphql/quick-start) describes the package family; its latest-major examples are not an instruction to upgrade this repository. [Apollo's migration guide](https://www.apollographql.com/docs/apollo-server/migration) documents Node/GraphQL prerequisites and the separate Express integration.

Backend dev dependency correction proposed for this integration: replace `@types/express@4.17.17` with `@types/express@5.0.6` (MIT). Current runtime is already Express 5. This is a related type-boundary change requiring explicit dependency approval and REST typecheck/regressions, not an unrelated upgrade. Do not solve resulting type errors with casts or `skipLibCheck` changes.

### Frontend generation and transport

| Package / proposed version                | Placement                                  | Rationale and alternative                                                                            |
| ----------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `@graphql-codegen/cli@7.4.5`              | devDependency                              | MIT; generate operation types from exported schema; alternative manually duplicated interfaces drift |
| `@graphql-codegen/client-preset@6.2.2`    | devDependency                              | MIT; typed operation documents, supports string document mode                                        |
| `graphql@16.14.2`                         | devDependency                              | MIT; codegen peer/runtime tooling; avoid importing parser/printer into browser code                  |
| `@graphql-typed-document-node/core@3.2.0` | devDependency, type-only generated imports | MIT; satisfies generated document type references, no intended runtime code                          |

Prefer native `fetch` plus the existing session boundary and TanStack Query. Generate string documents and import individual operation artifacts so the browser does not need an AST parser or an all-operations lookup map. GraphQL Codegen documents string mode for fetch/React Query in its [client preset guide](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#documentmode).

Do not add Apollo Client, another cache, `graphql-request`, or codegen SWC plugins initially. Native fetch still needs an explicit bounded transport adapter, response envelope parsing, error handling and typed operation decoders. Generated TypeScript types are not runtime validation: parse unknown JSON using existing frontend Zod and validate the selected operation's data before returning it. Avoid a generic `as T` response assertion. Client generation artifacts/configuration remain approval-dependent implementation work.

### Frontend rich-text editor

Propose aligned `3.31.4` versions for `@tiptap/react`, `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, and `@tiptap/extension-image`. All five registry packages declare MIT. The inspected React package peers include React 19. This is the open-source editor, without paid collaboration/cloud services. See the [React installation](https://tiptap.dev/docs/editor/getting-started/install/react), [Next.js integration](https://tiptap.dev/docs/editor/getting-started/install/nextjs), and [license](https://github.com/ueberdosis/tiptap/blob/main/LICENSE.md).

Tiptap supports custom nodes needed for inline gaps and figure/caption authoring. Keep accepted-answer configuration outside the rich-text node attributes. The image extension displays images; it does not implement upload, ownership or protected storage ([image documentation](https://tiptap.dev/docs/editor/extensions/nodes/image)). Provide those through the module's media adapter. Allow only approved formatting nodes; disable unwanted StarterKit features. Use a static safe renderer for learners and lazy-load the editor for author routes.

Alternative: Lexical can support this experience, but also requires custom gaps, figure handling and a persistence adapter. Native `contenteditable` would move selection/history/paste behavior into application code. Tiptap is the proposed choice for these concrete authoring needs, not a claim of universally smaller bundles.

### Size and verification limits

No browser bundle has been built with these packages. Registry unpacked sizes are disk package sizes, not minified/gzip sizes or total transitive cost. Examples checked: `@tiptap/core` about 3.22 MB, `@tiptap/react` 0.59 MB, `@tiptap/pm` about 0.015 MB excluding its ProseMirror dependencies; they cannot be added up to predict a route payload.

Server packages add zero intended browser bytes. Codegen packages run during development/build. Tiptap/ProseMirror are the material client cost: measure author-route chunks and verify public catalog/player chunks exclude them after implementation. Reuse installed RHF, Zod, dnd-kit, TanStack Query and UI components. Do not promise a bundle budget without a measured baseline.

## 12. Proposed migration sequence and reversibility

1. Add new platform authority/audit and Learning identity/lineage/content tables, nullable current-version pointers, and ownership constraints. Implement the agreed first-administrator seed only after explicit account selection and bootstrap safeguards are defined; do not grant roles implicitly as a side effect of DDL or ordinary demo seeding. Seed execution is a separate authorized action. Integrate account deletion prerequisites before enabling the new FKs in a writable environment.
2. Add topic composition and exact-version FKs, then the protected-media tables and referential constraints. Use new protected storage namespaces; changes to bucket policies or deployment are separate approval items.
3. Add guest sessions, attempts, operation receipts and partial unique indexes with the agreed retention fields. Add moderation cases/targets and lookup indexes before exposing copy/publication endpoints.
4. Validate every forward/reversal script on an isolated database and verify Prisma schema drift handling for custom checks, deferred constraints and partial indexes. Test with the actual installed Prisma version; do not assume a preview feature is available or enabled.

New-table DDL can use ordinary transactional index creation before serving traffic. Do not request concurrent index creation by default for empty new tables. Use explicit bounded lock/statement timeouts in deployment procedures. Production data cleanup, migration execution and seed changes need approval.

Before data exists, reversal removes dependent new FKs/tables in reverse order and restores the earlier client. After users create content, a destructive down migration is not a safe rollback: disable new writes/routes, retain tables/media, restore compatible code, then use a reviewed forward fix or approved export/restore procedure. Never rewrite merged migrations or promise data-preserving rollback by dropping populated tables.

## 13. Review outcome and next approval

Authenticated retention windows (14/3 days), guest use until page closure, first-administrator assignment through seed, and the specified content/image limits are now explicitly agreed. Remaining cleanup/receipt policy, guest technical expiry, bootstrap safeguards, additional payload bounds, private moderation preview and deleted-author attribution are still open. Review those details before the dependent migration/API is finalized.

Requested design approval, before producing a migration/package change:

- The relational ownership/draft/version model, retained lineage, attempt principal model, typed media uses, and fixed platform-role assignment approach.
- The Nest 11-compatible backend GraphQL set, code-first transport schema, codegen/native-fetch frontend, and Tiptap editor choice.
- The related Express type alignment and backend Zod addition; conditional DataLoader only where batching is needed.

After agreement, prepare exact Prisma declarations and SQL in a reviewable migration proposal, plus a precise manifest/lockfile change set. Creating/applying migrations, modifying dependencies, changing infra, or assigning roles remains separately authorized work. No dependencies have been installed and no database has been contacted for this document.
