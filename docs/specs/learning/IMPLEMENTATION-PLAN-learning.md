# Learning Tests and Topics — Implementation Plan

- Created: 2026-10-07
- Updated: 2026-10-12
- Status: Proposed; implementation not started
- Product baseline: [Feature specification](FEATURE-SPEC-learning.md)
- Architecture proposal: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Question contract proposal: [Five types, answers and results](QUESTION-CONTRACTS-learning.md)
- Lifecycle contract proposal: [State and access matrix](STATE-AND-ACCESS-learning.md)

## Approach and scope

Deliver the agreed module in complete, testable increments. First finalize contracts and approval-dependent changes, then integrate GraphQL/session boundaries, implement a complete standalone test flow, extend the builder, and add topics/copies/media and moderation. Publication, independent retention, and authorization invariants apply from the first relevant increment; they are not postponed as cleanup work.

In: every v1 requirement in the specification, including images, all question types, platform roles, and deletion choices. Out: courses, organizations, personal history/progress UI, audio, AI, REST migration, and a configurable role builder. An intermediate working slice is not completion of v1.

## Execution checklist

- [ ] 1. Finalize state transitions and typed contracts.
- [ ] 2. Present and obtain approval for schema, dependency, and any infrastructure changes.
- [ ] 3. Integrate GraphQL with the existing session and frontend transport boundaries.
- [ ] 4. Implement and verify a standalone test through draft, publication, attempt, and result.
- [ ] 5. Complete all question types and the authoring experience.
- [ ] 6. Implement independent copies, protected media, and atomic topic publication.
- [ ] 7. Implement platform roles, moderation, deletion, and retention workflows.
- [ ] 8. Complete discovery, view counting, and release verification.

## 1. Finalize state transitions and contracts

Apply the resolved O-09 source/removal choices, finish O-10 and define exact draft/publication/player/result schemas. Map each mutation to caller permissions, expected revisions, repeat behavior, current-access checks, and error codes. Define ownership versus current/draft composition and the visibility/deletion/blocking precedence table. Include new, never-published, pending-removal and detached exercises.

The question contract proposal supplies draft payloads, learner answer shapes, publication invariants, per-unit result fields and examples for all five kinds. The lifecycle contract adds ordinary/privileged access matrices, composition and attempt transitions, denial precedence, replay/concurrency rules and SA-01–26 verification scenarios. Never-published exercise keep/delete, own unpublished draft copying and metadata-only deletion of eligible blocked tests are confirmed. Finalize the remaining question/document/transport and lifecycle choices explicitly listed in those documents. These are partial phase-1 artifacts, not a completed phase or executable Learning validation.

Specify revision coordination for topic/exercise edits, one-active-attempt behavior, frozen scoring, guest authorization, and the copy/block and reference/cleanup consistency protocols. Apply authenticated retention (14 days since last activity / 3 days since submission) and guest page-only behavior with a 24-hour inactivity expiry. Resolve remaining O-01/O-02 activity/capability/cleanup details before implementing storage lifecycle. Identify moderation-specific gates without assuming access for an existing organization administrator.

Exit evidence: explicit invariants, input/output examples for every question type, state matrix, and a mapping from FR-LEARN-001–013 and AC-01–20 to planned checks. Record unresolved policy gates rather than inventing defaults.

## 2. Obtain approval for concrete changes

Prepare a reviewable Prisma/SQL proposal with relation ownership, deletion behavior, operation receipts, provenance, media uses, role assignments, audit and moderation records. Include a database-enforced active-attempt invariant and version/resource membership. Explain incremental migration, rollback, data/backfill impact, and generated-client changes.

Compare required GraphQL integration, generated client types, and rich-text editor packages. For every proposed dependency record purpose, existing/platform alternatives, client bundle impact, maintenance, license, and compatibility. Do not add Redis, queues, search infrastructure, or replace Prisma without a demonstrated need and separate authorization.

Exit gate: explicit user approval for migrations/schema changes, dependency additions/removals, and any necessary CI/infra modifications. Do not run destructive database scripts. Documentation approval does not grant these permissions.

## 3. Integrate GraphQL and session handling

Wire presentation adapters to the existing authentication/session behavior. Make GraphQL request context, CSRF, errors, origin handling and role checks explicit. Add the same-origin frontend GraphQL boundary with bounded upstream calls and safe refresh/retry behavior. Establish pagination, query-cost/depth limits, batching rules, operation logging/redaction, and error-to-client mapping.

Exit evidence: API tests for guest, authenticated, expired/revoked session, forbidden resource, infrastructure failure and repeated mutation; existing REST auth/CSRF behavior remains valid. No infrastructure failure is normalized to guest success.

## 4. Deliver the first complete standalone test flow

Start with single choice while retaining the designed question contract. Implement owner draft autosave, conflict handling, validation, immutable publication, immediate visibility change, authenticated resume/restart and server submission. Implement the approved guest capability/session path. Return allowlisted player content and persist idempotent result replay.

Exit evidence: unit evaluation/policy tests, PostgreSQL uniqueness/rollback/concurrency tests, and a browser flow from creation to guest/auth completion. Verify access revocation between load and submit, publication while an older attempt exists, repeat submission, and cross-device stale saves. Test exact 14-day/3-day expiry boundaries with an injected clock, no extension by polling/replay, replacement of expired active attempts, and guest non-restoration after page closure. This phase is an intermediate slice, not the v1 release.

Also verify guest reset on reload/leave/back navigation, a warning before sign-in with no transfer of answers, and the 24-hour inactivity boundary even if cleanup has not run. Retained server data must never become a closed-page recovery mechanism.

## 5. Complete the builder and evaluation types

Add multiple choice, text answers, mixed typed/select gaps and matching with accepted scoring. Add groups, shared text, formatting, explanations, duplication, reorder with keyboard alternatives, and preview. Preserve stable editor identifiers and remap them when duplicating. Handle invalid drafts without claiming saved/published success incorrectly.

Exit evidence: behavior tests for scoring edge cases and type-specific player projection; browser checks for mixed gaps, matching, reorder, preview, conflict UX, and whole-test feedback. Author explanations must not leak through preview/player data to unauthorized users.

## 6. Deliver topics, copies, and protected media

Add Materials/Exercises pages and owner composition. Copy independently with durable provenance and media references, including the owner's incomplete unpublished draft. Publish materials, ordering and exercise versions atomically. Implement pending removal/private detachment for published exercises and explicit keep/delete for never-published removal, including publication races. Block direct publication/deletion of a currently published embedded test outside its authorized workflow.

Own published tests offer publication (default) or draft as source; another author's public source offers publication only. Add independent copying from public topic exercise pages into an owned destination topic. Verify selected source snapshot/membership and reject stale selection instead of substituting a newer publication or draft.

Use protected media delivery, authorization at attachment time, bounded/validated uploads and safe cleanup. Preserve required files after source/account deletion. Enforce the approved 5 MiB JPEG/PNG/WebP input limit and resource counts from specification section 8; resolve remaining image-dimension/count and total-payload bounds before enabling upload. Keep uploaded bytes outside publication database transactions.

Exit evidence: AC-01–08 and AC-15; transaction rollback, original deletion, missing/invalid media, direct private-media requests, concurrent copy/cleanup and save/publication. Old attempts retain old content only while current authorization permits access.

## 7. Deliver roles, moderation, and deletion

Implement explicitly targeted, idempotent first-administrator assignment through seed after its account-selection/revocation safeguards are approved. Do not run a seed or promote an account as part of documentation work. Resolve later role assignment/revocation controls and last-admin protection before enabling privileged endpoints. Implement fixed role-to-permission checks and audit, including reasoned private-content review. Add impact preview, individual and lineage blocking, independent case unblocking, and administrator-only permanent deletion. Blocked owners cannot read, edit, preview, copy or publish content.

Implement topic deletion with keep/delete exercise choice and explicit notice about independent copies. Account deletion invalidates own resource access while preserving external copies/provenance/media as allowed by policy. Coordinate moderation, copy creation, role changes and cleanup; do not rely on source-account cascades.

Implement metadata-only owner deletion of eligible blocked tests without returning their content or clearing restrictions/evidence. Preserve the published-exercise deletion guard. Allow blocked-topic deletion with keep/delete choice without moderator approval or a new review. Kept exercises become private and retain inherited/own restrictions atomically; finalize case-target propagation and deleted-evidence review. Test deletion racing with unblock and multiple active cases; neither deletion nor restriction lifting implicitly restores access through the other state.

Exit evidence: role matrix API tests, stale privilege/revocation checks, owner bypass attempts, private descendant redaction, block/copy race, independent block recovery, and both topic deletion choices including draft-only/pending-removal exercises. PostgreSQL and storage integration checks prove surviving copies remain intact. No moderation feature is assumed complete solely because its UI hides an action.

## 8. Complete discovery and release verification

Add paginated Tests/Topics catalogs and owner libraries without embedded duplicate cards. Finalize permitted search/filter metadata and page-opening count semantics. Ensure private, blocked and deleted resources do not leak through lists, totals, errors or media access. Reuse shared loading/error/empty states and keep public routes independent of organizations.

Run typecheck, lint, FSD checks, focused/full unit suites, database integration and critical real-browser scenarios. Check production builds separately. Assess bounded queries, moderation impact pagination, autosave payload limits and media cleanup eligibility under expected load. Verify migrations/rollback in an isolated environment only after approval.

Exit evidence: every v1 acceptance criterion has a result; unresolved security/data-lifecycle gates block release. Record NOT RUN and remaining failures honestly. Commit/push/deployment require their own applicable authorization.

## Verification matrix

| Level                   | Responsibility                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Domain unit             | Question validation/scoring, access precedence, lifecycle transitions                        |
| Application unit        | Use-case authorization, orchestration, typed boundary mocks                                  |
| PostgreSQL integration  | FK/uniqueness invariants, transaction rollback, concurrency, receipts and lineage            |
| GraphQL/API integration | Inputs, guest capabilities, roles, errors, key/private-content leakage                       |
| Storage integration     | Protected reads, copy survival, failed upload/cleanup, reference races                       |
| Browser/e2e             | Critical author/player flows, resume, visibility, delete choices, moderator restrictions     |
| Static/build            | Backend/frontend typecheck/lint, frontend FSD, formatting, production builds                 |
| Migration/release       | Approved incremental migration/rollback, operational readiness and separate release evidence |

Typed tests use boundary ports/adapters, behavior-based assertions, AAA and `should_X_when_Y` naming. Do not weaken checks to make a phase pass. Avoid introducing tests that merely duplicate implementation details.

## Open policy gates

The specification's decision register is canonical. O-09 product choices are resolved. Authenticated 14/3-day retention, guest reset/sign-in behavior and 24-hour inactivity expiry, seed bootstrap, listed limits, removal choices and blocked-test/topic deletion rules are agreed. Remaining cleanup/receipt lifetimes, activity/capability details, bootstrap safeguards, dependency/editor approval, payload limits, counting semantics, restriction propagation/review scope and deleted-author attribution remain open. Revisit the proposed ADR when resolving a policy changes the architecture.

## Current evidence

These documents record planning only. No Learning schema, dependency, role, endpoint, migration, storage integration, or UI has been implemented by this documentation change. Existing repository checks, if run, validate the existing applications rather than the future feature.
