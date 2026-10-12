# Learning — Lifecycle and Operation Authorization

- Date: 2026-10-09
- Updated: 2026-10-12
- Status: Proposed operation contract; unresolved product choices remain explicit
- Implementation: Documentation only
- Baseline: [Feature specification](FEATURE-SPEC-learning.md)
- Architecture: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Related: [Question contracts](QUESTION-CONTRACTS-learning.md), [schema proposal](SCHEMA-AND-DEPENDENCIES-learning.md), [implementation plan](IMPLEMENTATION-PLAN-learning.md)

Confirmed on 2026-10-09: removing a never-published exercise offers keep-as-private/delete; the owner can copy their own unpublished draft into a topic; an owner can logically delete an eligible blocked test through a metadata-only action without recovering its content or erasing moderation evidence.

Subsequent decisions recorded on 2026-10-12: blocked-topic deletion requires no moderator approval/new review and kept exercises retain blocks; guest reload/leave resets the attempt, sign-in warns without transfer, and inactivity expiry is 24 hours; own published sources offer publication/draft choice with publication default, and public topic exercise pages support independent copying.

## 1. State is several independent facts

Do not implement one resource enum that conflates drafts, publication, visibility, moderation and deletion. A public test may have unpublished edits and an active block simultaneously.

| Fact             | Source of truth                                           | Consequence                                                                |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| Ownership        | Authenticated user and resource owner                     | Author rights; no organization role fallback                               |
| Editable content | Draft and optimistic revision                             | Only explicit publication changes visitor content                          |
| Publication      | Current immutable version pointer                         | Absence means no normal learner start, even if visibility is public        |
| Composition      | Desired draft membership and current published membership | Removing from a draft does not remove current public access                |
| Visibility       | Standalone resource or parent topic                       | Private, unlisted or public; changes immediately                           |
| Moderation       | All effective active restriction targets                  | Any applicable block denies ordinary content access                        |
| Deletion         | Logical deletion marker, later physical cleanup           | Immediate ordinary access denial; retained bytes are not access permission |
| Attempt state    | Principal, fixed version, revision, status and deadline   | Saved content and an old ID do not override current access                 |

`DRAFT_ONLY`, `PUBLISHED`, `PENDING_REMOVAL` and `DETACHED` below are explanatory labels derived from those facts, not proposed additional database status columns.

For an embedded exercise, both its own restrictions and its parent topic's restrictions apply. A source test's later ordinary changes do not affect an independent copy. Only an explicitly authorized moderation operation can apply restrictions across its lineage.

## 2. Policy evaluation and denial precedence

Each operation uses an explicit policy; authorization on a parent resolver or UI button is insufficient. Ordinary reads/mutations apply this order internally:

1. Validate request structure and establish the caller/session or guest capability. Authentication infrastructure failure is an error, not a guest fallback.
2. Resolve the relevant test/topic/attempt and bind IDs to their actual owner and parent/version. A supplied owner ID never grants authority.
3. Deny ordinary access to deleted resources or deleted parents, regardless of retained versions.
4. Deny ordinary content access if any effective test/topic restriction is active, including for the owner.
5. Check operation-specific ownership or current visibility/publication membership. A normal user with a platform role still follows these checks on ordinary endpoints.
6. For attempt/result operations, require the caller's own attempt, matching version membership, an allowed status and an unexpired deadline.
7. For writes, check expected revisions and operation identity, recheck access under the mutation's concurrency protocol, then commit all related state and the receipt together.

Internal denial precedence does not justify revealing private existence or moderation details. Unknown and inaccessible content use a safe non-disclosing response for unauthorized callers. Owners can receive the agreed blocked notice/reason without content. A public topic may show a blocked-exercise placeholder without its prompt, media or answer data.

Privileged moderation and metadata-only lifecycle commands use separate policies. They do not call an ordinary content endpoint with a global `ignoreAuthorization` flag. Unresolved operations are not exposed until their policy is decided.

## 3. Ordinary access matrix

All allowed cells require a live resource with no effective block/deletion. An authenticated non-owner includes teachers and users with platform roles acting through normal product endpoints.

| Resource / content                        | Guest                                       | Authenticated non-owner                     | Owner                                                          |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| Standalone draft, no publication          | Denied                                      | Denied                                      | Read/edit/preview draft; no normal learner attempt             |
| Public standalone publication             | Read/start                                  | Read/start                                  | Read/start plus author operations                              |
| Unlisted standalone publication           | Read/start with link                        | Read/start with link                        | Read/start plus author operations                              |
| Private standalone publication            | Denied                                      | Denied                                      | Read/start plus author operations                              |
| Unpublished edits beside a publication    | Denied                                      | Denied                                      | Read/edit/preview; publication remains separate                |
| Public/unlisted topic publication         | Read materials and current exercises        | Same                                        | Same plus topic/exercise author operations                     |
| Private topic publication                 | Denied                                      | Denied                                      | Same owner access as a private standalone resource             |
| Exercise only in topic draft              | Denied                                      | Denied                                      | Read/edit/preview draft; no normal learner start               |
| Published exercise pending removal        | Current topic publication remains available | Same                                        | Edit draft; remove/cancel removal through topic composition    |
| Detached exercise after published removal | Denied                                      | Denied                                      | Private standalone access; published version may remain usable |
| Own active attempt                        | Capability-bound guest only                 | Attempt principal only                      | Owner's own attempt only, not their students' attempts         |
| Submitted result                          | Current-page capability and lifetime only   | Attempt principal while retained/authorized | Owner's own result only                                        |

An unlisted link grants reading/taking, not ownership, draft access or a new right to copy another author's unlisted test. The agreed external copying source is a public test. Public catalog/library endpoints must apply their own policy before returning rows, totals or media; no embedded exercise cards in the public test catalog.

For a new start, resolve the current test version from the standalone publication or the current topic publication's exercise entry. For a continued attempt, use its pinned version while checking today's resource access. Do not require its version to equal the current version, and do not permit arbitrary historical-version browsing.

## 4. Resource and composition transitions

| Operation                                                       | Preconditions                                                                               | Result and visitor effect                                                                                                               | Existing attempts                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Create standalone test/topic                                    | Registered caller                                                                           | Owned private draft, no public content                                                                                                  | None                                                                                 |
| Save standalone draft                                           | Owner, live/unblocked, expected draft revision                                              | Draft revision advances; published pointer unchanged                                                                                    | Unchanged                                                                            |
| Save embedded exercise                                          | Owner, live/unblocked test and topic, expected revisions                                    | Exercise draft and topic aggregate revision advance coherently                                                                          | Unchanged                                                                            |
| Publish standalone test                                         | Owner, standalone, valid draft, expected revision                                           | Immutable version and current pointer commit atomically                                                                                 | Old attempts keep old version; new starts use new version                            |
| Publish topic                                                   | Owner, live/unblocked topic, coherent valid included exercises, expected aggregate revision | Materials/order/additions/content/removals commit together                                                                              | Only access-changing removals revoke other users; ordinary edits retain old attempts |
| Change standalone/topic visibility                              | Owner, live/unblocked resource                                                              | Access changes immediately without publishing draft                                                                                     | Rechecked on next read/save/submit/result/media request                              |
| Change embedded exercise visibility or publish it independently | Never via standalone action                                                                 | Reject; operation belongs to topic                                                                                                      | Unchanged                                                                            |
| Copy eligible source into topic                                 | Registered destination owner; source readable/copyable and destination writable             | New owned draft exercise, remapped IDs and durable media uses; destination draft revision advances                                      | No copied attempts, results or view counts                                           |
| Remove a published exercise from topic draft                    | Topic owner; topic writable; member identity checked                                        | Pending removal; old topic publication still contains it                                                                                | Continue under current access                                                        |
| Cancel pending removal before publication                       | Topic owner; topic writable; expected revision                                              | Restore desired membership/order without changing visitor publication                                                                   | Unchanged                                                                            |
| Publish removal                                                 | Valid topic publication with exercise excluded                                              | Detach as private standalone; preserve its draft and retained versions                                                                  | Other users lose access; retained answers follow original expiry                     |
| Remove a never-published draft exercise                         | Topic owner; writable topic; explicit keep/delete choice; expected revision                 | Immediately detach as private standalone or logically delete the owned copy; update topic draft only; source/external copies unaffected | No normal learner attempts                                                           |
| Delete own standalone test                                      | Owner, standalone; blocked content uses the separate metadata-only command                  | Remove from access/library immediately; preserve restrictions/evidence and perform later reference-aware cleanup                        | Inaccessible; no effect on independent copies                                        |
| Directly delete a currently published embedded test             | Ordinary author action prohibited                                                           | Reject; removal must be published first                                                                                                 | Unchanged                                                                            |
| Delete topic, keep exercises                                    | Owner; complete membership set and lifecycle policy checked                                 | Topic inaccessible; owned exercises become private standalone                                                                           | Other users lose access; retained attempts do not override privacy                   |
| Delete topic and exercises                                      | Owner; same coordinated checks                                                              | Remove topic and all owned member exercises from access/library                                                                         | Inaccessible; external sources/copies survive                                        |
| Delete account                                                  | Verified account action plus Learning lifecycle workflow                                    | Own resources inaccessible; other owners' independent copies survive                                                                    | Principal erasure/anonymization and cleanup require O-01/O-08 policy                 |

Publication atomically consumes one coherent topic draft. A save racing with publication either participates in that revision or conflicts; it cannot publish only half an exercise edit. A failed topic publication changes none of its visitor-visible content or detachments.

Topic deletion includes draft-only and pending-removal members, but not already detached standalone tests. Coordinate membership changes with deletion; a stale count is not approval to silently affect a different set. The confirmation explains that originals and independently owned copies/media survive.

For removal of a never-published exercise, the confirmation explains both choices and that its source/independent copies are unaffected. Check the never-published condition again under the topic publication/membership lock: a concurrent publication cannot convert this into immediate deletion of a now-published exercise. Return a conflict and refresh the action when that precondition changes.

An owner can choose their own unpublished test as a copy source. For an already-published own test, offer published version (default) or current draft. Copy the selected coherent snapshot, including incomplete draft content when chosen, through source/destination revision and media authorization checks. Another author's public source allows only the current publication. Public topic exercise pages offer “Add to my topic”; their published source is the exact exercise version in the current topic publication. The new exercise is an independent draft and cannot be published until valid. A changed selected source revision/version conflicts rather than silently substituting another snapshot. O-09 product choices are resolved.

Blocking is not a content edit. If a currently published exercise is blocked, its position becomes a safe unavailable placeholder immediately; other accessible exercises/materials remain accessible. Do not fetch the blocked body merely to render that placeholder. Publication rules for a draft still containing a blocked exercise are an O-07 gate; proposed behavior is to reject publication until that exercise is excluded or unblocked. Removing the blocked entry through metadata-only composition changes must never clear its own restriction.

## 5. Attempt transitions and deadlines

Status transitions below are the proposed storage contract. Current access denial is not a destructive attempt status. An expired row may still physically be `ACTIVE` until a coordinated transition/cleanup, but no API may treat it as resumable.

| Current state                                           | Operation                         | Required checks                                                          | Outcome                                                                                             |
| ------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| No active authenticated attempt                         | Start                             | Current published access and principal                                   | Create `ACTIVE` bound to current version/presentation; enforce unique user/test active attempt      |
| Unexpired `ACTIVE` exists                               | Continue/start discovery          | Same principal and current access                                        | Return existing attempt; offer continue or confirmed restart rather than silently replacing it      |
| Unexpired `ACTIVE`                                      | Save answers                      | Access, ownership, version membership, revision, valid complete snapshot | Persist answers and advance revision; no correctness feedback                                       |
| Unexpired `ACTIVE`                                      | Submit                            | Same checks plus terminal-state coordination                             | Atomically persist final answers, result, `SUBMITTED`, submission time and receipt                  |
| Unexpired `ACTIVE`                                      | Confirmed restart                 | Same principal, current published access, expected revision              | Old becomes `SUPERSEDED`; new `ACTIVE` uses latest version; no copied answers                       |
| `ACTIVE`, current access denied                         | Read/save/submit/restart          | Denial wins                                                              | Retain already-saved answers until applicable expiry; do not reveal them or create a bypass attempt |
| Access restored to unexpired `ACTIVE`                   | Continue                          | All restrictions removed and current visibility permits caller           | Resume original version and saved answers                                                           |
| `ACTIVE` reaches 14 days after last qualifying activity | Resume/save/submit                | Deadline checked during operation                                        | Reject; retire expired active row atomically when starting an eligible replacement                  |
| `SUBMITTED` before result deadline                      | Read/replay same submit operation | Principal, current access and expiry                                     | Same frozen result; no new completion or deadline renewal                                           |
| `SUBMITTED`                                             | Save/restart that attempt         | Terminal-state check                                                     | Reject mutation of completed answers; a retake is a separate new attempt                            |
| Completed result reaches 3 days after submission        | Read/replay                       | Deadline checked during operation                                        | No result/answer body returned; reference-aware cleanup follows                                     |
| `SUPERSEDED` or `EXPIRED`                               | Save/submit/resume                | Terminal-state check                                                     | Reject; no restoration through unblocking or publication                                            |

Ordinary publication does not renew an attempt's deadlines or change its scoring version. Time under revoked access does not pause the 14-day/3-day window. Background polling and receipt replay do not count as qualifying activity. The exact activity signal remains O-01; it must be consistent across devices and use server time.

Guest start/submit uses the same content and scoring authorization but a server-issued page capability rather than a user ID. Close, reload or leaving the test discards answers/results; returning starts fresh. Sign-in warns first and never transfers the guest attempt to the authenticated account. Do not restore it through persistent browser state or back-navigation caches. Guest server data expires after 24 hours without qualifying activity, including while the page is still open; access is denied at the deadline and cleanup removes expired data. This is cleanup retention, not a recovery window. Capability delivery, the exact activity signal and cleanup cadence remain O-02; polling/retry traffic must not indefinitely renew abandoned sessions.

On receiving access denial, the UI stops further answer submissions and hides protected content/results. This prevents continued normal interaction but cannot retract bytes already received by a browser. Live push revocation is not an agreed v1 mechanism; server-side authorization is rechecked on every operation, including cached-result and media delivery paths.

## 6. Moderation is a separate permission path

| Privileged action                                                            | Moderator               | Senior moderator                    | Platform administrator | Additional conditions                                                               |
| ---------------------------------------------------------------------------- | ----------------------- | ----------------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| Review public/unlisted content, including blocked content                    | Yes                     | Yes                                 | Yes                    | Explicit moderation endpoint and audit; draft/restricted-field scope still O-07     |
| Review private content                                                       | No                      | No                                  | Yes                    | Reason plus audit; blocking did not turn private content public                     |
| Block one test or topic                                                      | Within authorized scope | Within authorized scope             | Yes                    | Reason, current permission, target checks and audit                                 |
| Preview/confirm a test-lineage block                                         | No                      | Yes                                 | Yes                    | Bounded consistent target set; safe private-descendant projection                   |
| Lift a restriction                                                           | No                      | Yes, within authorized action scope | Yes                    | Specific case/target, reason, fresh role, audit; no implicit lifting of other cases |
| Permanently delete content                                                   | No                      | No                                  | Yes                    | Separate destructive command and evidence/retention policy                          |
| Assign/revoke platform role                                                  | No                      | No                                  | Yes                    | Atomic assignment/audit, bootstrap and last-admin safeguards                        |
| Edit another author's content or read learner answers merely because of role | No                      | No                                  | No                     | No such permission is granted by this feature                                       |

Check effective role freshly for privileged mutations. An organization owner/admin receives no platform rights. A moderator acting as a normal learner is still subject to current visibility, blocking and attempt ownership.

An individual block affects only that target; a lineage block explicitly creates restrictions for the selected source and descendants. Existing independent copies otherwise stay available under their own policies. A parent-topic block denies its exercises through both topic and direct test routes; it does not itself block independently owned external copies.

Restriction lifting is not republication, undeletion or visibility restoration. If one of two cases is lifted, access remains denied by the other. Lifting a topic restriction does not lift a child's own restriction. Expired/superseded attempts stay terminal. Permanent deletion is not reversible via an unblock command.

The owner may logically delete an eligible blocked test through a metadata-only command. Verify ownership and deletion eligibility without returning the blocked draft, publication, explanation or media. Remove it from the owner's library and ordinary access, retain active restrictions and required moderation evidence, and record the lifecycle action. This is not administrator-only permanent deletion. A currently published embedded exercise still cannot bypass the published-removal guard. Later lifting its block does not undo the owner's deletion.

A blocked topic may be deleted immediately by its owner using the same keep/delete exercise choice, without moderator approval and without opening a new review. The action reveals only authorized lifecycle metadata. Kept exercises become private standalone tests while retaining every applicable topic block and their own restrictions; deleted exercises remain inaccessible. Unrelated independent copies are unaffected.

Proposed implementation: in the deletion transaction, preserve each active inherited case as a restriction target on each kept exercise before detaching it. Keep the existing case identity and audit the deletion/target propagation; do not open another case or request a new moderation decision. Removing the topic relation must never create a readable interval. Existing independent cases still require independent lifting. Final target/provenance representation and concurrency with unblock require O-07 adapter design; the product behavior is settled. Self-moderation conflicts, deleted-content review, draft review scope and safe private-lineage impact fields remain open.

## 7. Operation concurrency and replay

These are semantic preconditions, not invented GraphQL endpoint names. Exact lock ordering follows the [schema proposal](SCHEMA-AND-DEPENDENCIES-learning.md); final adapter SQL and concurrency tests remain required.

| Operation family                   | Concurrency input / coordination                                                                       | Safe retry behavior                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Create resource                    | Principal-scoped operation identity                                                                    | Same created resource, no duplicate library entry                                |
| Save draft / reorder / composition | Expected draft/aggregate revision and operation identity                                               | Same accepted outcome; changed payload or stale new write conflicts              |
| Publish test/topic                 | Expected aggregate revision; lock affected membership/content and access state                         | Same publication, never duplicate versions or partial detachments                |
| Visibility change                  | Expected access revision and operation identity                                                        | Same target access state; cannot replay stale authorization                      |
| Copy into topic                    | Expected destination revision and explicit eligible source snapshot; lineage/access/media coordination | One independent copy; no duplicate exercise or lost media references             |
| Start authenticated attempt        | User/test active uniqueness plus current access                                                        | Concurrent starts converge on one active attempt                                 |
| Restart / save / submit            | Expected attempt revision and operation identity; coordinated access and state transition              | One replacement or completion; no overwritten terminal result                    |
| Delete resource/topic              | Expected resource/membership revisions, explicit exercise choice, operation identity                   | One logical deletion outcome, never scope expansion from a stale confirmation    |
| Block lineage                      | Preview scope revision, operation identity, lineage root/access locks                                  | Scope change requires refreshed preview; no descendant escapes a committed block |
| Lift restriction / assign role     | Expected case/assignment state, current privilege, operation identity                                  | One audited change; no lost concurrent restriction or role update                |

Revision failure must not return another user's or a now-blocked resource's draft. A replay still enforces current permission/retention before returning protected outcome data. For deletion, a future minimal receipt can acknowledge the caller's own completed command without loading deleted content; exact receipt retention and metadata remain O-01/O-07.

A copy checks eligibility against the actual snapshot chosen for copying, not only an earlier picker response. A public source that becomes private or blocked before the copy is authorized cannot be copied on the strength of the stale page. Once the copy commits independently, later source deletion/privacy changes do not revoke it; an explicit lineage block can.

## 8. Protected media and retained versions

Authorize a specific content use and projection, not just a known asset ID. Owner draft access, learner-visible publication content, post-submission explanations and authorized moderation are different contexts. A learner cannot retrieve an explanation-only image through an active-attempt context before submission. Reusing an image in already-visible content cannot promise that its bytes are secret.

An old version can be served only through an authorized retained attempt/result or permitted review context. Historical topic membership is evidence of a snapshot, not an access grant. Detached/private exercises, blocked parents and expired results deny old-version media through those now-invalid contexts.

Independent copies retain their own valid media uses. Removing a source use or source account cannot delete bytes still required by the copy. Conversely, another public use of the same bytes does not authorize browsing a private document, its caption or its resource metadata. Cleanup and new-reference creation must coordinate; physical deletion happens only after all required retention references are gone.

## 9. Required verification scenarios

These are future test obligations. No runtime policy is implemented by this document.

| ID    | Scenario                                                        | Expected outcome / related baseline                                                                                                                                   |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SA-01 | Public visibility without any publication                       | Owner preview only; no guest start or catalog content                                                                                                                 |
| SA-02 | Draft-only exercise in an already-public topic                  | No learner access through either topic or direct exercise URL                                                                                                         |
| SA-03 | Published exercise removed only from draft                      | Remains available from current publication; AC-02                                                                                                                     |
| SA-04 | Removal publication during another user's attempt               | Private detachment denies further reads/saves/submission, retains unexpired answers; AC-03                                                                            |
| SA-05 | New content published during active attempt                     | Old questions/keys/order remain pinned; current access still checked                                                                                                  |
| SA-06 | Public becomes private between load and submit                  | Non-owner denied, no receipt/cache bypass; AC-05                                                                                                                      |
| SA-07 | Test block and topic block overlap                              | Lifting either alone is insufficient; AC-12/13                                                                                                                        |
| SA-08 | Blocked exercise inside accessible topic                        | Safe placeholder, remaining accessible content usable; no body/media leak                                                                                             |
| SA-09 | Topic block and direct exercise request                         | Direct URL cannot bypass parent block                                                                                                                                 |
| SA-10 | Source deletion/account removal after copy                      | Copy and its media survive; AC-01                                                                                                                                     |
| SA-11 | Topic deletion keep/delete, including pending removals          | Complete owned set affected consistently, external copies unchanged; AC-04                                                                                            |
| SA-12 | Copy races with block or media cleanup                          | No escaped restricted descendant or deleted referenced asset; AC-07/08                                                                                                |
| SA-13 | Topic publication races with exercise save                      | Coherent publication or conflict, no partial visitor change; AC-06                                                                                                    |
| SA-14 | Two devices start/save/restart/submit                           | One active attempt and one terminal outcome; AC-09/10                                                                                                                 |
| SA-15 | Access restored after vs before attempt expiry                  | Only unexpired still-active attempts resume; AC-16/17                                                                                                                 |
| SA-16 | Owner/moderator tries another user's result                     | Denied unless a future separately approved capability exists                                                                                                          |
| SA-17 | Private descendant in senior moderator impact preview           | No private content/media disclosure; AC-11                                                                                                                            |
| SA-18 | Direct old-version or explanation-only media request            | Reference/projection/current-access checks deny unauthorized retrieval; AC-14/15                                                                                      |
| SA-19 | Guest closes, reloads, leaves or initiates sign-in              | Answers/results reset with no recovery; sign-in warns before losing progress and never transfers answers; AC-18                                                       |
| SA-20 | Platform privilege revoked before moderation mutation           | Denied despite old client/token state; assignment/audit safeguards covered by AC-20                                                                                   |
| SA-21 | Owner removes never-published exercise with keep/delete choice  | Private independent draft or logical deletion; no visitor change, source/copies unaffected; concurrent publication conflicts                                          |
| SA-22 | Owner copies incomplete unpublished draft into topic            | Independent editable copy; publication blocked until valid; another owner's private draft remains denied                                                              |
| SA-23 | Owner deletes eligible blocked test                             | No content disclosed, library entry removed, restrictions/evidence retained; unblock does not restore deleted resource                                                |
| SA-24 | Owner deletes blocked topic with keep/delete choice             | No approval/new review; kept exercises are private and retain every effective block atomically; delete choice preserves required evidence; independent copies survive |
| SA-25 | Guest reaches 24 hours without activity                         | Access denied even before cleanup; expired answers/results and protected receipt data are cleaned; polling does not extend inactivity                                 |
| SA-26 | Own draft/publication choice or copy from public topic exercise | Publication defaults for own published source; others expose only current publication; selected source stays coherent or conflicts; no draft/access leak              |

## 10. Open decisions and next implementation gate

This matrix supplies the state/operation portion of phase 1. It does not resolve all feature gates or approve database/dependency changes.

- O-09 is resolved at product level: removal choices, own draft/publication selection with publication default, and public topic exercise copying. Implement source revision/membership checks without silently changing the chosen snapshot.
- O-07: blocked-test/topic owner deletion is confirmed without approval/new review; kept exercises retain effective blocks. Final restriction propagation, publication around blocked exercises, moderator draft/deleted-content scope, self-moderation and safe private impact preview remain open.
- O-01/O-02: activity signals, cleanup cadence, receipt lifetimes and guest capability delivery remain open. Guest reset on reload/leave, sign-in warning/no transfer and 24-hour inactivity expiry are agreed.
- O-03/O-08: platform bootstrap/last-admin safeguards, account erasure and retained attribution/evidence.
- O-04/O-05/O-06/O-10: remaining document/request limits, packages/transport, view counting and question validation details are still tracked in the feature specification.

Resolve the relevant open choices before exposing dependent operations. Then translate the agreed policies into typed domain rules, transport contracts and boundary tests alongside a separately approved concrete schema/dependency change set. This document records behavior and proposed coordination, not passing Learning authorization tests.
