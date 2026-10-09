# ADR-0010: Version Learning publications and retain independent exercise copies

- Status: Proposed — product baseline agreed; concrete schema, packages, and open policies pending
- Date: 2026-10-07
- Updated: 2026-10-09
- Scope: New Learning Tests/Topics module and necessary platform integrations
- Specification: [Learning v1](../specs/learning/FEATURE-SPEC-learning.md)
- Delivery: [Implementation plan](../specs/learning/IMPLEMENTATION-PLAN-learning.md)
- Payload proposal: [Question, answer and result contracts](../specs/learning/QUESTION-CONTRACTS-learning.md)

## Context

Users need standalone tests and topic pages with independently submitted exercises and explanatory materials. Editing must not mutate a published page until publication, or replace questions in an already-started attempt. A teacher's copied exercise must survive deletion of its source and source account. Access changes and moderation must still take effect immediately.

Existing Vocabulary supplies useful patterns for use cases, repository ports, editor concurrency and idempotency, but it is not this module's domain model. Existing organization roles do not grant platform moderation rights. The current storage model and public image delivery cannot by themselves satisfy independent retention and private Learning media access.

This ADR proposes the technical realization of the agreed specification. It records alternatives and tradeoffs; it is not an applied Prisma migration or approved package list. Open policies are tracked in the specification rather than assigned arbitrary defaults here.

## Decision

### 1. Keep GraphQL at the transport boundary

Add a Learning module with domain, application, infrastructure, and GraphQL presentation layers. Organize domain/application responsibilities around tests, topics, attempts, and moderation without creating a module per question type. Keep existing REST modules intact.

Resolvers validate/map inputs and invoke authorized use cases. Domain errors map to transport errors at the boundary. Separate GraphQL editor/player/result types; do not expose ORM entities or an unrestricted question JSON scalar. Question types use discriminated internal contracts, with type-specific evaluation strategies.

The question contract proposal makes those boundaries concrete for all five v1 kinds, including mixed gap modes and one-to-one matching. Keep scoring unit identity separate from question identity: choice/text contribute one unit, gaps and matching contribute one unit per gap/left element. Reject malformed answers before evaluation; omissions remain valid zero-point units. Exact points are canonical; displayed percentages are whole numbers. Remaining normalization, document and transport details are explicit O-10 work.

Adapt request-context extraction, session verification, CSRF protection, and error filters for GraphQL. Preserve REST behavior with regression tests. Reuse existing session refresh infrastructure in a same-origin frontend GraphQL path; finalize its route and authentication error contract before coding. A transport error must not silently become a guest session.

Reuse TanStack Query as the existing client server-state layer. Server-render initial readable pages where appropriate. Keep route entrypoints thin and outside the organization-required dashboard. Builder and player remain separate user flows; shared question display belongs below their consumers. Follow the project's `views` convention and prevent same-layer slice cross-imports. The exact editor, GraphQL driver, and code-generation packages require a separate justified proposal.

### 2. Separate resource identity, draft, publication, and access

Proposed records:

| Record                                   | Responsibility                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `LearningTest`                           | Owner, topic membership or standalone visibility, current publication, deletion marker, provenance |
| `TestDraft`                              | Mutable metadata/content with optimistic revision                                                  |
| `TestVersion`                            | Immutable validated publication with content/schema/scoring versions                               |
| Draft/version group and question records | Ordered typed question payloads and stable element identifiers                                     |
| `LearningTopic`                          | Owner, immediate visibility, current publication, deletion marker                                  |
| `TopicDraft`                             | Editable metadata/materials and aggregate revision                                                 |
| `TopicDraftExercise`                     | Desired ordered exercise composition                                                               |
| `TopicVersion`                           | Immutable metadata/materials snapshot                                                              |
| `TopicVersionExercise`                   | Ordered references to exact test versions                                                          |
| `TestAttempt`                            | Principal, test/version, status, revision, answers and submission result                           |
| Lineage record                           | Source ancestry that survives source content/account deletion                                      |
| Media asset/reference                    | Physical object identity and independently retained uses                                           |
| Moderation case/target and audit records | Independent restrictions, scope, actor and reason                                                  |
| Platform role assignment                 | Fixed platform role independent of organization membership                                         |
| Operation receipt                        | Idempotent result associated with principal, operation, payload and transaction                    |

These are conceptual responsibilities, not a promise of one SQL table per row. The migration proposal must specify concrete names, foreign keys, indexes, and payload schemas.

Use relational ownership, ordering, version links, access, and attempt identity. Type-specific question configuration and rich-text documents may use schema-versioned JSONB with runtime/semantic validation. Do not store an entire unvalidated test as an opaque blob. Draft schemas allow incomplete author input; publication schemas enforce playable content.

Store visibility separately from moderation restrictions and deletion. For an embedded test, effective visibility comes from its topic. Parent membership, desired draft composition, and membership in the current publication are distinct. A new draft-only exercise cannot become publicly readable simply because its topic is public.

Visibility changes are immediate and never publish drafts. Ordinary user access requires the relevant publication, current access eligibility, absence of effective blocks, and absence of logical deletion. Reading an old version is permitted only for an authorized use such as an active attempt or moderation; possession of a version ID grants no authority.

### 3. Publish a topic as one coherent transaction

One publication command checks an expected topic revision and all included content. Saving an embedded exercise must invalidate the topic revision used for publication. Under the chosen transaction/locking protocol:

1. Recheck owner/access, blocking, deletion, and expected revisions.
2. Validate the topic and every included exercise.
3. Create immutable versions for changed exercises; reuse eligible unchanged versions.
4. Create a topic version referencing exact exercise versions and durable media references.
5. Switch the current publication and detach removed copies as private standalone tests.
6. Commit the publication receipt with the mutation.

No storage upload/deletion occurs inside this transaction. Media must already be ready and authorized for inclusion. Prevent separate standalone publication of topic-owned exercises.

Use `expectedRevision` and a principal/operation-scoped `operationId` for retriable writes. Same key and payload returns the existing outcome; a different payload conflicts. Do not use last-write-wins for author drafts or cross-device answers. Define lock ordering and retry limits before implementing concurrent multi-resource operations.

### 4. Retain snapshots for attempts, but reevaluate permissions

Authenticated users have at most one active attempt per test, enforced at the database level. A test version determines content and scoring for that attempt. Start again atomically supersedes the previous active attempt; submit atomically stores its terminal result. Concurrent start, restart, autosave, and submit must not create two active attempts or mutate completed answers.

Reevaluate access on reads, saves, and submission. A detached exercise becomes private, so another user's saved attempt becomes inaccessible even though its version is retained. Ordinary content updates allow continuation against the previous version. Authorization failure retains answers unless an explicitly agreed deletion/retention policy applies.

Guest attempts need a server-issued session/capability and version binding, not an arbitrary public attempt ID. Guests use only the current open page, without restoration after closure. Do not persist a recovery credential for that purpose. Browser-close notifications cannot guarantee server-side deletion; use bounded technical expiry and cleanup. Its duration and exact reload/navigation handling remain open, without changing the agreed no-recovery-after-close behavior. Player payloads expose no keys; matching returns independent choice collections rather than correct pair mappings. Keep randomized choice identity/order stable within an attempt. Evaluate only identifiers from its version.

Pin scoring behavior as well as content. Authenticated unfinished attempts expire **14 days after last activity**; completed results expire **3 days after submission**, without renewal on replay. Enforce expiry on access even if cleanup has not run. Atomically retire expired active attempts before starting a replacement so the uniqueness constraint does not strand the user. Retain versions/media only while other valid references still require them. Technical tombstones may retain minimal operation identity under the later receipt policy but must not keep expired answers/results retrievable. Completion storage does not add a history screen. Define the user-activity signal and cleanup cadence under O-01; background polling must not reset inactivity.

### 5. Copy content independently; preserve only provenance links

Copying materializes a new owned test/draft, remaps internal question/option/gap identifiers consistently, and creates independent media references. Source lineage is provenance and moderation metadata, not a content-loading dependency. Do not cascade source deletion into descendants.

Retain a minimal non-content lineage identity after ordinary source/account deletion, with author display handled by the agreed personal-data policy. A chain of immediate source links is the initial conceptual model; the concrete descendant-query/index strategy must support bounded impact review without N+1 traversal. An individual request cannot expand an arbitrary graph without limits.

Copy eligibility and lineage-wide blocking must use a common consistency protocol. A count shown before confirmation is not authorization to act on a silently different descendant set: detect stale scope or use an explicitly defined cutoff/locking rule. Role permissions and private-content restrictions apply throughout.

### 6. Control media access and retention separately

Physical storage objects may be shared for efficiency, while drafts, publications, and independent copies own explicit references. Deleting the uploader does not delete another owner's valid reference. Never trust a submitted asset ID without checking permission to attach it.

Learning media needs protected delivery using the context of an authorized reference. Do not reuse a permanent public image URL for private or blocked material. Define cache invalidation and the allowed lifetime of any delivery capability consistently with immediate access revocation. A viewer's already-downloaded data cannot be recalled.

Garbage collection coordinates with creation of new references; a stale zero-reference scan cannot authorize deleting a newly referenced object. Use an explicit pending-deletion/claim protocol, transaction-aware reference creation, and a final eligibility check. Required versions retain their references. Final SQL constraints and storage cleanup sequencing must be reviewed together.

### 7. Treat deletion as an explicit lifecycle operation

An ordinary direct delete of a currently published exercise is rejected. Removing it through the topic draft and publishing detaches it to private standalone ownership.

Topic deletion is a distinct command with an explicit keep-exercises/delete-exercises choice. Apply it to the complete owned membership set, including draft-only/pending-removal copies, with consistent access invalidation. Explain that originals and independent external copies survive. Account deletion similarly removes own content from access without recursively deleting other owners' copies.

Logical access removal precedes physical cleanup. Permanent administrative deletion respects the approved evidence/retention policy while denying access immediately; no claim is made that every byte can be deleted in one database transaction. Blocked owners cannot use ordinary edit/copy/export endpoints to recover content. Metadata-only deletion/account actions need a separately specified authorization contract (O-07).

### 8. Use fixed platform roles with operation permissions

Implement moderator, senior moderator, and platform administrator as fixed roles mapped to explicit permissions. Organization roles are never a fallback. Moderator: eligible content review and individual blocking. Senior: additionally lineage blocking and unblocking. Administrator: additionally permanent deletion and platform role management.

Private-content review requires platform administrator permission plus a reason and audit record. A lineage action against private descendants does not expose their content to a senior moderator. Blocking does not broaden review scope. Owners cannot inspect or edit blocked content; an authorized moderation actor uses a separate privileged pathway.

Persist independent moderation cases/targets so lifting one case does not erase another. A topic restriction and an exercise restriction are independently effective. Unblocking must not republish, undelete, change visibility, or restore another case implicitly.

Evaluate role assignments with an explicit freshness/revocation policy instead of relying indefinitely on stale token claims. Bootstrap the first platform administrator through an explicit seed targeting a configured account. Keep this separate from organization roles and ordinary demo-data seeding; reruns must be idempotent and must not silently regrant revoked privileges. Account selection, bootstrap safeguards, later assignment controls, and last-administrator protection remain approval gates. Audit privileged actions and role changes with minimal necessary metadata; exclude secrets and question/answer bodies from operational logs.

## Contract requirements

Before generating a schema, define typed editor/player/result projections and input variants for every question type. Proposed operation groups:

| Group          | Operations                                                                              |
| -------------- | --------------------------------------------------------------------------------------- |
| Read           | Paginated catalog/library, published test/topic, owner draft, active attempt            |
| Author         | Create test/topic/exercise, save draft, preview, copy into topic, remove draft exercise |
| Publish/access | Publish test/topic, immediate visibility change                                         |
| Lifecycle      | Delete standalone test, delete topic with exercise choice                               |
| Attempt        | Start, continue, restart, save answers, submit                                          |
| Moderation     | Safe impact preview, block single/lineage/topic, unblock case, administrative delete    |
| Platform roles | Assign/revoke fixed roles through administrator-only operations                         |

Names and complete SDL are proposals, not existing APIs. Inputs bind owner identity to authenticated context, not a trusted client-supplied owner ID. Errors expose stable codes and safe field/question details. Avoid leaking private resource existence where the caller lacks access.

Required constraints include version-to-resource membership, one draft per resource, ordered composition integrity, valid topic/test ownership, and at most one authenticated active attempt per test. Use database constraints where possible, with semantic validation for JSON payload references and typed media references. Partial indexes or custom SQL must be included in the migration proposal where the ORM schema cannot express the invariant.

## Alternatives considered

| Alternative                                   | Reason not chosen                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Topics reference another author's live test   | Source edits/deletion could break a teacher's topic                                   |
| Update published questions in place           | Changes an existing attempt and makes coherent topic publication impossible           |
| Let embedded exercises publish independently  | Violates the agreed single topic publication action                                   |
| Share source-owned public image URLs          | Neither independent retention nor private/revocable delivery is guaranteed            |
| Copy full media bytes for every copy          | Possible fallback, but unnecessary if independent references and delivery are correct |
| Store all state in one JSON document          | Weakens ownership, concurrency, lifecycle constraints, and query boundaries           |
| Use organization administrators as moderators | Grants unrelated tenant roles platform-wide authority                                 |
| Add a generic permission/role editor          | Not required for the agreed fixed v1 roles                                            |
| Migrate existing REST/Vocabulary to GraphQL   | Outside the request and increases regression scope                                    |

## Consequences

More records and explicit transitions are required than for mutable CRUD, but publications, attempts, and copies have independent lifetimes. Storage cleanup and moderation become coordinated workflows. GraphQL adapters need specific authorization, error mapping, query bounds, and frontend session handling; domain rules remain transport-independent.

Immutable versions do not imply infinite retention. The agreed authenticated windows are 14 days for unfinished attempts and 3 days for completed results. Guests do not recover attempts after page closure; the first administrator is seed-assigned. Enforce the specification's agreed content/image limits through centralized configuration at all mutation boundaries. Remaining cleanup/receipt policy, guest technical expiry, bootstrap safeguards, additional payload bounds, mixed-visibility moderation details, and unpublished exercise edge cases remain explicit gates. No migration/package/infra change is authorized by this proposed ADR.

## Validation required

Use the specification's AC-01 through AC-20 and phase gates in the implementation plan. Unit tests verify scoring and policy transitions. PostgreSQL integration verifies constraints, rollback and races, including expiry versus resume/start/submit. API tests verify per-operation access, limits and absence of answer-key leakage. Browser checks cover guest/auth flows, drafts/publication, resume, guest page closure, deletion choices and role restrictions. Seed tests cover targeted bootstrap and safe reruns. REST session/CSRF/storage regressions must be checked separately.

## Repository evidence

Read-only references that motivated integration boundaries; these files are not modified by this ADR:

- [Backend architecture](../../backend/ARCHITECTURE.md)
- [Frontend architecture](../../frontend/ARCHITECTURE.md)
- [Session-aware JWT strategy](../../backend/src/auth/presentation/guards/jwt.strategy.ts)
- [HTTP CSRF guard](../../backend/src/common/guards/csrf-origin.guard.ts)
- [Editor operation/revision pattern](../../backend/src/vocab/application/use-cases/save-deck-editor.use-case.ts)
- [Current Prisma models](../../backend/prisma/schema.prisma)
- [Existing S3 provider](../../backend/src/storage/providers/s3-storage.provider.ts)
- [Frontend REST proxy URL construction](../../frontend/src/shared/api/proxy/proxy-upstream.ts)
