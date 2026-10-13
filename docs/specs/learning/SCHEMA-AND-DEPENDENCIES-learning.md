# Learning — Schema and Dependency Proposal

- Date: 2026-10-09
- Updated: 2026-10-13 (contract reconciliation; package metadata rechecked; Codegen transitive Node mismatch recorded)
- Status: First schema, migration, and backend dependency increment implemented and verified in an isolated database; no application database or deployment was used
- Product baseline: [Feature specification](FEATURE-SPEC-learning.md)
- Architecture: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Delivery sequence: [Implementation plan](IMPLEMENTATION-PLAN-learning.md)
- Payload proposal: [Question, answer and result contracts](QUESTION-CONTRACTS-learning.md)
- Lifecycle proposal: [State and operation authorization](STATE-AND-ACCESS-learning.md)
- Repository inspected: `docs/learning-contracts`; existing documentation changes preserved

## 1. Review boundary

This is a concrete relational design and a proposed package list. Table/column names below are proposed database names; they are not existing APIs. The final Prisma definitions and additive SQL migrations require separate review. The specification now fixes authenticated retention at three days for completed results, with no server unfinished attempts, guest use until page closure, first-administrator assignment through seed, and content/image limits. O-01–O-10 tracks remaining details; nullable expiry fields do not imply unlimited retention.

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
| `published_at`                           | `timestamptz?`, first publication time, never renewed by editing       |
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
| `published_at`                           | `timestamptz?`, first publication time                                                   |
| `created_at`, `updated_at`, `deleted_at` | As above                                                                                 |

Required checks: a live resource has an owner; `topic_id IS NULL` exactly when `visibility IS NOT NULL`. Add `UNIQUE(id, owner_user_id)` to topic and test identities where needed by compound ownership FKs. A test's `(topic_id, owner_user_id)` references `(learning_topics.id, owner_user_id)`; a separate simple topic FK ensures topic existence even after owner anonymization. No ownership transfers are introduced in v1.

`ON DELETE SET NULL` does not implement account deletion alone. Before removing a user, the account deletion transaction marks their Learning resources deleted and invalidates access. A check `owner_user_id IS NOT NULL OR deleted_at IS NOT NULL` rejects an uncoordinated deletion instead of leaving live ownerless resources. Both deletion ordering and existing account flows require integration tests before this FK is deployed.

Keep a minimal identity tombstone while versions, moderation, or attempts need it. Do not cascade account deletion through independently owned copies. Title/description live in draft and version records; catalog reads join the current version, never the mutable draft.

## 4. Editable and published test content

Use separate draft and version tables so editing cannot accidentally update a publication. All editable text below defaults to empty valid draft data; publication applies stricter rules.

Author editor changes reach draft storage only through explicit “Save draft”; they are not periodically autosaved. Preserve optimistic revisions despite manual saving: concurrent tabs can still submit stale snapshots. Publication consumes a saved revision without an implicit content-save step. Topic/exercise revision coordination and learner persistence is submit-only. Copying a draft reads its selected saved server revision, never unsubmitted local edits.

| Table                             | Columns and keys                                                                                                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `learning_test_drafts`            | `test_id` PK/FK, `revision integer`, `title text`, `description text`, `schema_version integer`, `updated_at`                                                                                                    |
| `learning_test_draft_groups`      | `(test_id, group_key)` PK, `position integer`, `title text`, `instruction jsonb`, `material jsonb`; FK to draft                                                                                                  |
| `learning_test_draft_questions`   | `(test_id, question_key)` PK, `group_key`, `position`, `kind text`, `prompt jsonb`, `configuration jsonb`, `solution jsonb`, `explanation jsonb`; compound FK to its group                                       |
| `learning_test_versions`          | `id` PK, `test_id` FK, `version_number integer`, `title`, `description`, `schema_version`, `scoring_version integer`, `max_points integer`, `created_at`; unique `(test_id, version_number)` and `(test_id, id)` |
| `learning_test_version_groups`    | `(version_id, group_key)` PK, `position`, `title`, `instruction`, `material`; FK to version                                                                                                                      |
| `learning_test_version_questions` | `(version_id, question_key)` PK, `group_key`, `position`, `kind`, `prompt`, `configuration`, `solution`, `explanation`, `max_points`; compound FK to its version/group                                           |

A question without visible grouping uses a default group with optional empty material; no orphan group-less question shape. Enforce unique group position per draft/version and unique question position per group. Use deferred unique ordering constraints in reviewed SQL, or a fully specified collision-free reordering protocol; do not rely on arbitrary sequential position updates.

Question kinds: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TEXT`, `GAPS`, `MATCHING`. `GAPS` contains typed per-gap modes. Partial/incomplete `solution` values are valid only in drafts.

The question contract proposal specifies the discriminated configuration/solution shapes and publication refinements. Matching uses equal left/right collections and a bijective solution without extra choices. Pin NFC/trim/lowercase/NFC normalization through `scoring_version`; preserve internal whitespace/punctuation/apostrophe distinctions and exact points with a whole-number percentage display. Publication rejects normalized duplicate accepted text answers and requires at least two choice options, two matching pairs and one gap in a gap question. Incomplete drafts remain saveable. These bounded JSON semantic rules belong in publication validation, not a new uniqueness constraint across independent questions. Publication also rejects identical visible options within each choice list while draft saves preserve them. Visible-text label equivalence and matching-side duplicate rejection are agreed; concrete document extraction and transport validation are proposed below.

The `configuration` column contains learner-visible structure; `solution` contains keys. For matching, configuration holds independent left/right elements, while solution holds mappings. For gaps, prompt nodes reference gap IDs and configuration holds input modes/options; acceptable answers belong in solution. Validation ensures IDs are unique and references remain within the question. Column separation reduces accidental disclosure but does not replace allowlisted player projection.

Rich text uses an application-owned, versioned allowlist of nodes/marks. Tiptap is an authoring adapter, not a backend dependency. Represent media with asset IDs and gaps with gap IDs; reject raw scripts, arbitrary node attributes and unvalidated external image URLs. The renderer emits safe React elements and validated links, not arbitrary stored HTML.

Do not create one table per option type in v1: bounded options are read and versioned with the question. Do not introduce a generic unvalidated `JSON` field in the public GraphQL contract just because persistence uses JSONB.

## 5. Topic drafts and publications

| Table                              | Columns and keys                                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `learning_topic_drafts`            | `topic_id` PK/FK, `revision integer`, `title text`, `description text`, `materials jsonb`, `schema_version integer`, `updated_at`                                       |
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

### `learning_test_openings`

Guest capability derivation and replay are agreed in section 14; the concrete storage representation is in the reviewed model fragment. It binds one open page to an authorized immutable version without storing pre-submit answers or an attempt. Never persist a recovery credential, expose credential hashes or restore closed/reloaded pages. The opening binding has a fixed 24-hour deadline; guest completed-result expiry is 24 hours from submission.

### `learning_test_attempts`

`id text PK`, `opening_id text UNIQUE`, `test_id`, `test_version_id`, `user_id?`, `principal_kind`, `principal_key`, `guest_result_secret_hash?`, `answers jsonb`, `presentation jsonb`, `result jsonb`, `submitted_at`, `expires_at`, `erased_at?`.

Create this row only during successful submission; answers/result are validated and committed atomically with the operation receipt. Exactly one user/guest principal and version-to-test membership remain enforced. No ACTIVE/SUPERSEDED statuses, answer revision, last-activity fields or partial unique active-user/test index. Multiple tabs may create independent completed attempts. Authenticated expiry is submission plus three days, never renewed by reads/retries. Guest principal/capability behavior is specified in section 14 and the concrete model fragment; guest results expire 24 hours from submission. Pre-submit version authorization must retain the bound immutable version/media safely without an attempt row; binding lifetime is 24 hours from opening; the concrete opening/version references are in the model and SQL proposal. Account deletion uses the agreed immediate denial/hourly erasure policy.

### `learning_operation_receipts`

`id text PK`, `principal_key text`, `operation_name text`, `operation_id text`, `payload_hash text`, `outcome jsonb`, `created_at`, `expires_at`. Unique `(principal_key, operation_name, operation_id)`; use opaque user/opening identities, not profile fields. Receipt storage never grants authorization; replay rechecks the current principal and target.

Store minimal versioned outcomes/IDs rather than an unrestricted copy of private content. A receipt is committed with its business mutation. Replaying it still checks current session, role, resource access, blocking, deletion and result expiry before returning protected data. Otherwise an old success receipt would bypass immediate revocation or keep an expired result available. A different payload with the same operation key conflicts. Submission mutation receipts allow replay for 12 hours from commit; authenticated result retrieval remains available separately for three days. Expired commands are rejected without re-execution through the agreed ticket mechanism. Receipts never duplicate answer/result bodies.

## 7. Provenance and copying consistency

### `learning_test_lineage`

`id text PK`, `parent_id text?`, `root_id text`, `tree_revision integer`, `created_at`; unique `(id, root_id)`. Each test has exactly one node. A root has `parent_id = NULL` and `root_id = id`; a copied node references its parent in the same root using a compound FK. Parent/root links are immutable. Retain these minimal non-content nodes independently of source owner/content deletion.

Use a recursive PostgreSQL query over indexed parent links for descendant discovery, not one query per child. Start with an adjacency tree; no closure-table storage or graph dependency. Disallow reparenting and cyclic updates at the repository boundary; insert children only under an existing locked parent. Define a bounded moderation workload and fail explicitly if it exceeds the approved v1 limit rather than partially applying a block.

Proposed race protocol: copy and lineage-block mutations first lock the lineage root row. Copies check current source authorization and all effective restrictions, create the new node/resource/media references, increment root `tree_revision`, and commit. A moderation preview returns revision plus safe scope information; confirmation rejects a changed revision and requires a refreshed preview. A successful block and copy cannot interleave into an unblocked escaped descendant. This serializes rare tree mutations while leaving ordinary reads outside the root lock.

An individual block also participates in the copy consistency protocol. Topic access/blocks must be checked under the relevant topic/test locks when copying embedded resources. Lock order is root (when needed), topics, tests, attempts, assets; sort IDs within a category. Other operations cannot acquire these in reverse order. Exact SQL and race tests are required before approval of the migration/adapter implementation.

Own unpublished-draft copies use an explicitly selected draft revision rather than requiring a source publication. Copy one coherent snapshot and remap all child IDs/references; incomplete author content is valid draft data, not publishable content. Keep lineage independent of any optional source version so unpublished sources have valid provenance too.

For a published own source, choose publication (default) or draft explicitly; other authors' public sources permit publication only. A public topic exercise copy resolves the selected test version through the current topic-version membership. Carry the selected draft revision or publication/version identity in the proposed command and reject stale source selection rather than silently copying different content. Recheck source visibility, parent restrictions, membership and destination ownership in the coordinated copy transaction.

## 8. Media with typed uses

### `learning_media_assets`

`id text PK`, `storage_key text UNIQUE`, `uploader_user_id? FK ON DELETE SET NULL`, `mime_type text`, `byte_size bigint`, `width integer?`, `height integer?`, `state text`, `created_at`, `deletion_claimed_at?`, `lease_expires_at?`.

States: `UPLOADING`, `READY`, `DELETING`; failed/abandoned uploads follow a cleanup policy rather than pretending publication succeeded. The uploader is attribution, not lifetime ownership. Store bytes in protected Learning storage using existing local/S3 transport capabilities through a new authorized adapter. Do not change existing public Vocabulary images as collateral work.

### `learning_media_uses`

`id text PK`, `asset_id FK`, and exactly one of `test_draft_id?`, `test_version_id?`, `topic_draft_id?`, `topic_version_id?`, each with a real FK to its containing record. Use four unique asset/parent pairs (null pairs are allowed), and an exactly-one-parent SQL check. No generic `(ownerType, ownerId)` without referential integrity.

Uses are at content-container granularity: repeated use of one image in several questions requires one retention link for that container. Captions and placement belong to the rich-text document, not to the shared asset. The server derives uses from validated documents and rejects unauthorized asset attachments; do not trust a client-supplied retention list.

To collect an asset, lock it, recheck there are no live uses and no valid upload lease, set `DELETING`, then commit. Reference creators lock the same asset and accept only `READY`; they cannot attach a deletion-claimed object. Physical deletion happens after commit with a retryable outcome. On failure, keep deletion state rather than reopening it for attachment. A crashed collector can resume. Section 14 proposes a 24-hour unreferenced-upload lease for approval.

Delivery authenticates a specific currently authorized use and returns protected bytes. A shared asset cannot authorize access merely because a caller knows its ID. Public topic publication does not make every future private use permanently public. Image upload uses a dedicated authenticated HTTP/storage endpoint and returns an asset ID to GraphQL; no multipart-GraphQL package is proposed.

## 9. Platform authority and moderation records

### `platform_role_assignments`

`user_id text PK/FK`, `role text CHECK (MODERATOR|SENIOR_MODERATOR|PLATFORM_ADMIN)`, `assigned_by_user_id? FK SET NULL`, `assigned_at`, `revision integer`. One effective graded role per user; absence means no platform privileges. A fixed permission map grants lower-grade capabilities explicitly. No role arrays or generic permission-editor schema in v1.

Read role state freshly for privileged operations. Revocation must not wait for an access token to expire. Role assignment and audit must commit atomically. The first platform administrator is explicitly assigned through seed to a configured account. Organization ownership and ordinary demo-data seeding do not confer that role. Make bootstrap idempotent and prevent ordinary reruns from silently restoring revoked privileges. Apply agreed existing-account ID bootstrap, one-time rerun safeguards, immediate revocation, one-role assignment and last-active-admin protection; no seed is run by this proposal.

### `learning_moderation_cases`

`id PK`, `scope text (TEST|TEST_LINEAGE|TOPIC)`, `root_lineage_id? FK`, `topic_id? FK`, `reason text`, `opened_by_user_id? FK SET NULL`, `opened_at`, `scope_revision? integer`, `state text (OPEN|CLOSED)`. Exactly one appropriate root target for the scope. Bounded reason strings contain no content dumps.

### `learning_test_restrictions` and `learning_topic_restrictions`

Test restrictions: `(case_id, lineage_id)` PK/FKs, `applied_at`, `lifted_at?`, `lifted_by_user_id?`, `lift_reason?`. Use lineage identities so ordinary source content removal does not erase restrictions/provenance.

Topic restrictions: `(case_id, topic_id)` PK/FKs, the same lifecycle fields. Topic identity tombstones remain while cases need them. Effective test access denies any active own restriction or active parent-topic restriction. One case may have many targets; lifting a target does not clear another case. Case closure requires no active target restrictions.

Lineage-wide action can include private descendants without granting a senior moderator their content. Preview uses the agreed total counts and authorized published metadata; hidden/private-unpublished targets expose only aggregate counts. Both author APIs and media delivery deny blocked content. Only an authorized moderation review pathway may retrieve it; administrators must provide a reason for private content review.

### `platform_audit_events`

`id PK`, `actor_user_id? FK SET NULL`, `action text`, `target_kind text`, `target_id text`, `reason text`, `request_id text`, `occurred_at`, `details jsonb` with a strict allowlist. Audit target identity is intentionally an immutable event value rather than a cascading content FK. This preserves evidence after a target is removed; it is not used to authorize resource loading.

Record private review authorization, block/unblock/delete, and role changes. Do not retain names, emails, tokens, private document bodies or learner answers in `details`. Apply agreed one-year immutable administrator-only audit retention and opaque account-deletion identifiers. A denied privileged action must not accidentally return content if its audit write fails.

## 10. Constraints, access paths, and deletion order

PostgreSQL supports partial unique indexes and composite FKs. Cross-table conditions must not be hidden inside `CHECK` expressions: use actual FKs or transactionally verified invariants. Custom database features require reviewed SQL where the installed Prisma version cannot express them. See [PostgreSQL constraints](https://www.postgresql.org/docs/15/ddl-constraints.html) and [Prisma custom database features](https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/unsupported-database-features).

| Access path                  | Proposed supporting index                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Owner library                | Tests/topics `(owner_user_id, updated_at DESC, id)`                                                                                      |
| Public catalog               | Partial index on `(published_at DESC, id)` for public, published, nondeleted standalone tests/topics; restriction checks remain required |
| Exercise composition         | Unique `(parent_id, position)` for each draft/version composition                                                                        |
| Resource/version association | Unique `(test_id, id)` or `(topic_id, id)` on versions                                                                                   |
| Latest submitted result      | Principal/test/submission-time index for latest authorized result; no active uniqueness                                                  |
| Attempt retention            | `(expires_at, id)` and indexed version FK; deadlines use `submitted_at`, not maintenance updates                                         |
| Descendant discovery         | `(parent_id, id)` and `(root_id, id)`                                                                                                    |
| Effective restrictions       | Partial `(lineage_id)` / `(topic_id)` where `lifted_at IS NULL`; separate case-target keys                                               |
| Media cleanup                | `(state, created_at, id)` plus `asset_id` and parent indexes on uses                                                                     |
| Receipt expiry               | `(expires_at, id)`                                                                                                                       |
| Moderation audit             | `(occurred_at, id)`, `(actor_user_id, occurred_at)` and `(target_kind, target_id, occurred_at)`                                          |

Do not add broad JSONB GIN indexes until a concrete query uses JSON predicates. Catalog indexes follow agreed level/newest/views/title access paths; add only indexes justified by those queries. PostgreSQL does not automatically index every referencing FK; include the required reference/deletion lookup indexes in migration review.

Apply the agreed configuration limits to all write/copy/duplicate paths: 100 questions and 20 groups per test; 10 options per choice question/selectable gap; 20 gaps or matching pairs per question; 50 exercises per topic. Validate each image input at no more than 5 MiB (5,242,880 bytes), with JPEG/PNG/WebP content. These are configurable application-boundary limits, not cross-row `CHECK` subqueries. Check aggregate counts under the parent's mutation lock so concurrent additions cannot exceed the limit. Apply all approved text, dimensions, insertion and request limits from specification section 8.

Physical cleanup must first establish no live current pointer, unexpired opening binding/retained result, or retained topic version needs a test version. Remove eligible topic-version exercise links before test versions; remove child questions/groups and media uses with their eligible container. Only then can unreferenced assets be claimed for deletion. Provenance and audit follow their own approved retention, not content cascades.

Topic deletion's keep/delete choice operates on all owned membership, including unpublished and pending-removal copies. A former exercise already detached by a completed publication is no longer a current member and is not deleted again. Publication/removal locks prevent it escaping or joining the deletion set midway. Independent copies elsewhere are unaffected. Logical deletion denies access immediately even when retained evidence prevents physical cleanup.

Never-published exercise removal also has an explicit keep/delete choice: detach as private standalone or logically delete the owned copy while removing its draft membership atomically. Lock/recheck topic revision and publication membership so a concurrent first publication cannot be bypassed. An owner may logically delete an eligible blocked test through a metadata-only operation; keep its restriction targets/lineage and required evidence. Do not use that command to directly delete a currently published embedded exercise.

Blocked-topic deletion needs no moderator approval or new review. Kept exercises become private and retain all effective inherited/own blocks. Preserve each inherited active case as an exercise restriction target before clearing `topic_id`, inside the same transaction. Reuse the original case identity; lifting that case clears its propagated targets while independent test cases remain. Retain the topic tombstone and audit propagation; do not create a new review case. Coordinate deletion with block/unblock and preserve independent cases. Adapter sequencing and deleted-evidence review remain O-07 implementation work; no actual runtime schema change is made here.

## 11. Dependency proposal and evidence

Initial registry research was 2026-10-09. On 2026-10-12 rechecked exact peer/license metadata for Nest GraphQL/Apollo 13.4.5, Apollo Server 5.5.1, Express integration 1.1.2, GraphQL 16.14.2, Tiptap React/StarterKit 3.31.4 and Codegen client preset 6.2.2. Other listed package versions retain their earlier research date. Version compatibility below is based on declared peer ranges and the inspected repository, not an installation/build proof. Pin initial candidates exactly when approved, retain the lockfile, and recheck advisories and transitive licenses before installation. No package was installed for this proposal.

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

Registry verification on 2026-10-13 found an environment gate: the proposed Codegen CLI depends on `listr2 ^10.2.1` and `@inquirer/prompts ^8.3.2`. Their checked versions require Node >=22.13.0 on the Node 22 line; local Node 22.12.0 does not satisfy that requirement. The CLI's direct engine declaration alone is insufficient. Resolve the Node patch level and verify the full installed dependency graph before frontend installation; do not suppress engine checks. [listr2 metadata](https://registry.npmjs.org/listr2/10.2.1), [prompts metadata](https://registry.npmjs.org/@inquirer%2fprompts/8.3.2).

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
3. Add opening bindings, completed attempts, operation receipts and their uniqueness/expiry indexes with the agreed retention fields. Add moderation cases/targets and lookup indexes before exposing copy/publication endpoints.
4. Validate every forward/reversal script on an isolated database and verify Prisma schema drift handling for custom checks, deferred constraints and partial indexes. Test with the actual installed Prisma version; do not assume a preview feature is available or enabled.

New-table DDL can use ordinary transactional index creation before serving traffic. Do not request concurrent index creation by default for empty new tables. Use explicit bounded lock/statement timeouts in deployment procedures. Production data cleanup, migration execution and seed changes need approval.

Before data exists, reversal removes dependent new FKs/tables in reverse order and restores the earlier client. After users create content, a destructive down migration is not a safe rollback: disable new writes/routes, retain tables/media, restore compatible code, then use a reviewed forward fix or approved export/restore procedure. Never rewrite merged migrations or promise data-preserving rollback by dropping populated tables.

## 13. Review outcome and implementation scope

Authenticated three-day result retention and submit-only creation, guest reset on close/reload/leave, sign-in warning/no transfer, 24-hour guest opening-binding expiry, first-administrator seed and content/image limits are agreed. Source selection/public topic exercise copying and blocked-topic deletion without new review are also agreed. Product policy is agreed; section 14 consolidates the engineering mechanisms and budgets for review before the dependent migration/API.

The user approved the initial concrete schema and backend dependency increment. It is now present in the runtime Prisma schema and additive migration; this did not authorize applying it to a project database or deployment.

The original design approval covered:

- The relational ownership/draft/version model, retained lineage, attempt principal model, typed media uses, and fixed platform-role assignment approach.
- The Nest 11-compatible backend GraphQL set, code-first transport schema, codegen/native-fetch frontend, and Tiptap editor choice.
- The related Express type alignment and backend Zod addition; conditional DataLoader only where batching is needed.

The following remain separate implementation and deployment work: application database migration execution, infra changes, seed execution, assigning roles, storage/scheduler setup, and user-facing routes. The temporary verification database was isolated and discarded after testing.

## 14. Consolidated implementation proposal — 2026-10-12

This section supersedes older active-attempt/activity-renewal proposals. Product decisions are agreed; the concrete mechanisms and numeric engineering budgets below are proposed for approval, not installed or executed.

Concrete schema and SQL artifacts: [database change proposal](proposals/README.md). These are review files outside the runtime schema/migration directory.

### A. Opening binding, submission and replay

- Add `learning_test_openings`: `id`, `test_id`, `test_version_id` (compound membership FK), `user_id?`, `principal_kind`, `principal_key`, `guest_secret_hash?`, `presentation_seed`, `created_at`, `expires_at`, `revoked_at?`. The optional completed attempt is an inverse relation through unique `learning_test_attempts.opening_id`, not a second pointer column. Exactly one principal mode. No answers, result, mutable answer revision or ACTIVE status. Expiry is opening +24 hours. Index expiry and version FK; the row temporarily retains that version/media. For guests, derive the opening capability with domain-separated HMAC from the opening ID, nonce in the original signed operation ticket, and a versioned server key; store only its hash. Keep the raw capability only in current page memory, and return it only for the same valid ticket. Never place it in a URL, log, localStorage or sessionStorage. Authenticated openings bind the existing session's user. Role/session/access checks remain current on every operation.
- `openLearningTest` is a mutation because it establishes the opening lease; catalog/prefetch reads never create it or count a view. Its signed ticket binds principal, operation, resource, nonce, canonical payload hash, issue time, admission deadline and key version. A retry with the same valid ticket derives the same capability and returns the same opening; a different ticket cannot recover it. Return allowlisted content, presentation and expiry. A lightweight internal opening lease is not a saved learner attempt and cannot restore answers. Independent tabs receive independent leases.
- `submitLearningTest` accepts opening capability, signed operation ticket and full answer snapshot. The ticket binds principal, operation, opening, nonce, canonical payload hash, issue time, admission deadline and key version. Lock/recheck opening, principal, current test/topic access, expiry and version membership; validate/evaluate and create completed attempt plus receipt atomically. Bind one completion to an opening with a unique opening FK; changed payload on replay conflicts. A new retake requires a new opening. If submission fails, no completed row exists and client inputs remain local. Current ordinary republication does not change the bound version.
- Completed attempts retain required answers/result/presentation only after submit: user +3 days, guest +24 hours. Successful submit returns a separate page-bound guest result capability derived with a distinct HMAC domain from attempt ID, the submit ticket nonce and its key version; store only its hash. A retry of that same valid ticket derives the same result capability, while another ticket cannot recover it. Result and media endpoints validate the relevant capability, principal, retention and current access. No credential recovery or user-answer transfer on sign-in.
- Issue signed server-authenticated operation tickets using platform crypto; bind principal, operation, resource, nonce, canonical payload hash, issue time, server admission deadline and key version. Admission window is 12 hours. A committed receipt lasts 12 hours from commit; an authorized retry can use the receipt during that window even if admission has ended, and receives the same deterministically derived capability when applicable. A changed payload under the same operation identity conflicts. If no receipt exists and the ticket is expired, reject without execution; once the receipt expires, reject without re-execution. Client clocks/UUID timestamps are not trusted. Persist only capability hashes and receipt resource/outcome identifiers, never raw capabilities or duplicate answer bodies. Keep old signing keys through the admission and receipt replay windows of tickets issued with them. Clean expired receipts hourly. Use platform crypto; environment configuration is a separately reviewable change.
- Preserve an expired-result distinction with a short opaque result locator authenticated to the original principal; after result cleanup it reveals no scores/content. A new result locator cannot restore erased data. Final locator encoding must not expose profile data.

### B. Document contract and bounds

Application-owned `schemaVersion: 1` document nodes: root, paragraph, text, hard break, heading (levels 1–3), ordered/bullet list, list item, blockquote, figure (authorized asset ID plus plain-text caption), and inline gap (ID only). Marks: bold, italic, underline and HTTP(S) link. Field-specific allowlists enforce the agreed editor restrictions; labels permit text and three style marks only. Gaps occur only in eligible prompt paragraphs/list paragraphs, never headings/links/captions/other gaps. No arbitrary editor JSON attributes, HTML, styles, external image URLs or solution-bearing metadata.

Proposed defensive limits: depth 12; 10,000 nodes per rich document; list nesting 3; 2,048 characters per link URL; 2,000 characters per image caption; 20 accepted alternatives per typed answer/gap. Apply existing 1 MiB/document and 10 MiB/full draft-save request caps as well as visible-text limits. The proposed answer-submit cap is an independent 2 MiB UTF-8 request ceiling; it does not guarantee that every combination of maximum counts and grapheme lengths fits (100 ×20 ×500 four-byte characters already exceeds it). Measure maximum valid payloads before adopting the transport budget; reject overflow without partial writes or truncation. Extract rendered text in document order: concatenate inline text regardless of formatting/link marks, emit one `\n` for each hard break, and separate adjacent rendered block children with exactly one `\n`. Nested containers do not add a second separator; do not trim the extracted string. Figure captions count; image data/IDs, gap IDs/numbering and other structural metadata do not. Count extended grapheme clusters over the result with the same versioned client/server extractor. Duplicate-label comparison uses NFC, edge trim and collapse of ordinary U+0020 space runs, preserving case/punctuation.

### C. GraphQL and repository boundaries

Keep existing REST. Code-first Nest GraphQL 13/Apollo 5/GraphQL 16 remains the proposed compatible set; use existing frontend fetch/session handling and TanStack Query, with generated string operations and runtime Zod decoding. Use distinct author/player/result/moderation DTOs and field-level projections; no unrestricted JSON scalar for arbitrary question/document payloads. Typed nested DTOs validate at the transport boundary and application-owned discriminated decoders validate stored JSON. Domain services depend on repository/storage/clock ports rather than GraphQL/Prisma/editor types.

Proposed API budgets: one operation per request, no HTTP batch arrays, maximum query depth 8, weighted cost 1,000 (list multipliers include bounded page sizes), operation timeout 15 seconds, upload timeout 30 seconds. Draft mutations allow the agreed 10 MiB payload; ordinary reads/submit obey lower per-operation bounds. Lists default 20/max50 with deterministic ID tie-breakers; literal case-insensitive substring search uses escaped ORM parameters. No fuzzy/full-text/trigram dependency initially. Platform role account picker is paginated and administrator-only.

Reuse existing throttler through a GraphQL-aware adapter: proposed guest openings 30/minute/IP, submits 30/minute/IP; authenticated openings/submits 60/minute/user; upload 10/minute/user. Return explicit retry information and preserve local inputs. These are request safety limits, not limits on total retakes. Shared-IP impact must be checked before release; do not silently add active-session count caps. In-memory limits are only single-process protection; a multi-instance deployment needs an approved shared enforcement design before claiming global limits.

### D. Protected images and cleanup

Current source already has a private attachment controller/provider path; existing image paths remain public. Extend authorized storage through a dedicated Learning adapter and namespace rather than assuming all existing storage is public or modifying unrelated attachment behavior. Upload one image via authenticated same-origin multipart REST (outside GraphQL); validate decoded image/bytes/dimensions through installed Sharp, reject animation/multiple frames in v1, normalize orientation and strip metadata. Store privately and return an owned asset ID. No new image-processing dependency. Private S3/local deployment routing must be verified before release; no bucket/infra modification is authorized here.

Serve Learning images through authorized same-origin delivery with no-store; guest access uses page capability, never a persistent public asset URL. Use fetch/blob presentation for guest images so the secret need not enter a URL; revoke blob URLs on disposal. Do not use public CDN URLs or unauthenticated static routes for Learning assets. Lock assets during reference creation/deletion claims. Proposed unreferenced-upload lease: 24 hours from upload; cleanup hourly only when no draft/version/opening/result/evidence/copy reference retains the asset. Logical block/deletion denies future reads immediately; cleanup cannot retract already delivered bytes.

### E. Moderation and approval scope

Keep fixed single platform roles, one-time account-ID bootstrap and atomic last-active-admin protection. Staff never read unpublished content. Individual/lineage restrictions are independent case targets; when deleting a blocked topic and keeping exercises, add each active topic case ID as a target on every kept exercise lineage before detachment. Lifting that case clears these propagated targets but leaves separately opened test cases active. Do not create new cases. Lock lineage roots, sorted topics/tests/openings, then assets consistently and coordinate target propagation with concurrent unblocking. Reject stale impact confirmation; if any selected target is the actor's own content, reject self-moderation rather than secretly omitting targets or revealing hidden bodies. Evidence and audit follow agreed 30-day post-case/one-year policies; profile fields are erased on account deletion while required opaque IDs remain.

No new queue/scheduler dependency: propose an hourly idempotent maintenance command following existing maintenance patterns. Scheduling it in deployment is a separate infrastructure approval. Existing retained references—not guessed age alone—decide content/file eligibility.

Approval covers the proposed document budgets, opening/receipt representation, media flow and dependency family. Actual Prisma/schema/migration files, package installation, lockfile changes, seed execution, infrastructure and deployment require their applicable explicit authorization. No database or runtime code changed for this package.
