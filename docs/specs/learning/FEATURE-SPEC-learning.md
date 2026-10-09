# Learning Tests and Topics — Feature Specification

- Version: v0.3
- Updated: 2026-10-09
- Status: Agreed product baseline; implementation details remain open
- Implementation: Not started
- Architecture: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Delivery: [Implementation plan](IMPLEMENTATION-PLAN-learning.md)
- Question contracts: [Author, player, answers and results](QUESTION-CONTRACTS-learning.md)

## 1. Purpose and scope

Add user-authored tests and topic pages to dash-stack. English exercises are the initial use case; question types and scoring must not depend on a particular subject. Registered users create standalone tests or topics containing independent exercise copies and explanatory materials. Guests can study accessible published content.

The new module uses GraphQL alongside existing REST. Preserve NestJS, Prisma, PostgreSQL, the current authentication/session system, backend Clean/Hexagonal Architecture, and frontend FSD. Organization membership is not a prerequisite.

This document records the latest agreed behavior, including decisions made after the independent requirements review. Earlier proposals for live references to source tests, separate visibility for embedded exercises, or author editing after moderation blocking are superseded.

### In v1

- Standalone tests, topic pages, author libraries, and separate Tests/Topics catalog tabs.
- A question builder, autosaved drafts, explicit publication, learner preview, and versioned attempts.
- Text materials with basic formatting and uploaded images with captions.
- Independent copies, durable media, immediate access changes, and explicit deletion choices.
- Platform moderation, fixed platform roles, and audited privileged operations.

### Outside v1

- Courses, learning paths, assignments, organization-owned content, and collaborative organization editing.
- Completion history UI, best/latest score summaries, mastery, and personal progress analytics.
- Audio/listening uploads, AI generation, automatic generation from flashcards, subscriptions, and a configurable role builder.
- Per-question feedback modes: v1 checks the whole test on submission.

Courses, progress, and audio are future directions without an agreed delivery order. Organizations are a distant possibility, not a committed v2 feature. This specification does not add moderation to existing Vocabulary or other modules.

## 2. Terminology

| Term             | Meaning                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Test             | An owned learning resource with a mutable draft and immutable published versions           |
| Topic            | An owned page with Exercises and Materials tabs                                            |
| Exercise         | A test belonging to a topic; access is inherited from that topic                           |
| Independent copy | A new owned test with its own draft, versions, and durable media references                |
| Version          | A fixed published content snapshot, not a permanent access grant                           |
| Attempt          | Answers and evaluation against one specific test version                                   |
| Lineage          | Technical provenance linking copies, retained independently of source content availability |
| Block            | A moderation restriction; distinct from visibility, publication, and deletion              |

## 3. Authoring requirements

### FR-LEARN-001 — Question builder

All requirements in this section are Must for v1.

Support single choice, multiple choice, text answer, typed gaps, selectable gaps, and matching. A gap question may mix typed and selectable gaps. Authors insert gaps using an editor action rather than a required special text syntax.

Questions can be grouped with optional titles, instructions, and shared text. Groups can mix question types; a simple test must not require filling in shared materials. Provide basic formatting (including bold, italic, lists, and links), explanations, learner preview, reorder by drag and drop, and duplication of questions/groups. Provide accessible alternatives to drag-only interaction.

Duplicating editor elements creates independent element identifiers. Matching authors enter correct pairs; learners see shuffled choices. Shared reading material, topic theory, and post-submission answer explanations are separate concepts.

Matching uses equal left/right collections with a one-to-one correct mapping and no extra choices in v1.

Acceptance:

- Given a mixed group, the author can add, duplicate, reorder, edit, and preview its questions without changing another question's answer keys.
- Given mixed gaps, each gap retains its own input mode and acceptable answer configuration across save/reload.
- Given an incomplete question, autosave preserves it; publication identifies the invalid question and field.

### FR-LEARN-002 — Drafts and publication

Autosave incomplete drafts. Do not expose unpublished content to visitors. Publishing requires valid content; one invalid included exercise prevents publication of the entire topic change.

A standalone test is published independently. A topic has one publication action covering its materials, exercise order, additions/removals, and exercise content changes. Embedded exercises must not bypass topic publication through a standalone publish operation.

Detect concurrent edits rather than silently overwriting newer work. Display unsaved, saving, saved, failed, and conflict states accurately. Preserve local inputs when saving fails.

Acceptance:

- Given an existing publication, editing its draft leaves visitor content unchanged.
- Given a failed topic publication, visitors see the complete previous publication, not a partial update.
- Given a stale autosave, newer content is preserved and the author receives a conflict.

### FR-LEARN-003 — Topics and materials

Topic pages provide Exercises and Materials tabs. Exercises are ordered, independently submitted tests, such as Exercise 1/2/3. Each exercise displays all its groups/questions on one page. Materials support headings, basic formatting, links, images, and captions.

Text is the initial implementation slice; images remain required for the completed v1. Audio is excluded. An uploaded image in a private draft must not become publicly accessible merely because its storage URL is known.

## 4. Copying and catalog

### FR-LEARN-004 — Independent copies

Adding an existing test to a topic always creates an independent copy, including when the source belongs to the topic owner. Authors can select their own tests and other authors' public tests. Public authors cannot disable copying; publication explains this behavior.

Copy questions, materials, answer keys, explanations, scoring configuration, and references sufficient to retain all required files independently. Do not copy attempts, results, or view counts. Record attribution and source provenance. Source changes, visibility changes, deletion, or source account deletion do not change the copy.

Copying another author's unpublished or private content is not authorized. Source eligibility for the owner's unpublished drafts and copying exercises directly from public topic pages are open UI/API details (O-09).

Acceptance:

- Given a published source copied into a topic, later deleting the source or its owner's account does not remove copied content or media.
- Given an edited copy, neither its source nor other copies change.
- Given a deleted source, lineage still permits discovery of descendant copies for authorized moderation.

### FR-LEARN-005 — Discovery and view counts

Provide separate Tests and Topics catalog tabs. Embedded copies do not appear as separate catalog cards. Paginate catalogs and author libraries.

Count test page openings, including guest openings. Starts and completions analytics are not required. Repeat-opening deduplication, bots, prefetching, and whether topics receive a separate counter are open (O-06); do not equate server fetches with human page openings by accident.

## 5. Access and lifecycle

### FR-LEARN-006 — Visibility

| Visibility         | Ordinary published access                        |
| ------------------ | ------------------------------------------------ |
| Private            | Owner only                                       |
| Unlisted / by link | Anyone with the link; absent from public catalog |
| Public             | Anyone; discoverable in public catalog           |

An embedded exercise inherits topic access, without its own visibility selector. Drafts remain owner-only regardless of the eventual publication's visibility, subject to explicitly authorized moderation access.

Visibility changes take effect immediately through a separate action. They do not publish drafts. Making a resource visible exposes only already-published content; a draft without a publication does not become playable.

Recheck current access on attempt reads, answer saves, submissions, copy operations, and media delivery. A saved version does not override revoked access. Revocation stops ordinary access while preserving saved answers for possible restoration.

### FR-LEARN-007 — Exercise removal

| Operation/state                                      | Visitor behavior                                 | Owner behavior                               |
| ---------------------------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| New exercise exists only in draft                    | No visitor access                                | Can edit/preview                             |
| Published exercise is removed from draft             | Remains in current publication                   | Sees pending removal                         |
| Removal is published                                 | Exercise disappears from the topic               | Copy becomes a private standalone test       |
| Removed copy has another user's active attempt       | Attempt becomes inaccessible; answers retained   | Owner still has the private copy             |
| Ordinary edit is published without access revocation | Started attempts retain their original questions | New starts use the latest applicable version |

An individual test used in a current topic publication cannot be permanently deleted before its removal is published. Topic/account deletion and privileged deletion are separate coordinated operations, not an accidental cascade through this guard.

For an exercise never published, immediate detachment into a private standalone test is an engineering proposal pending confirmation (O-09); it must not become an unreachable orphan.

### FR-LEARN-008 — Topic and account deletion

When deleting a topic, offer a choice:

1. Keep its exercises as private standalone tests in the owner's library.
2. Delete the topic and its exercises from access and the owner's library.

Show the affected exercise count and explain that original tests and independent copies made by other users, including their copied materials, remain unchanged. Include draft-only and pending-removal exercises when calculating what is affected; do not silently omit them.

Suggested confirmation copy:

> Видалити тему «Future forms»? Тема стане недоступною за посиланням і зникне з каталогу.
>
> Зберегти вправи як приватні тести у моїй бібліотеці / Видалити разом із темою.
>
> Оригінальні тести та незалежні копії, які створили інші користувачі, залишаться незмінними. Їхні копії ваших матеріалів також збережуться.

Defaulting the dialog to keep exercises is the proposed safe UI default, not a restriction on the owner's choice.

Deleting an account removes that account's own tests/topics from access, but not independent copies owned by others. Logical removal, physical cleanup, and retained moderation evidence are distinct. Retention and deleted-author display rules remain open (O-01, O-08).

## 6. Taking and scoring tests

### FR-LEARN-009 — Submission and scoring

Allow answer changes until whole-test submission. Do not reveal correct answers or correctness feedback during the attempt. After submission show total score, correct answers, and author explanations. Skipped answers are incorrect without an additional confirmation dialog. Retakes are unlimited.

| Type            | Evaluation                                      |
| --------------- | ----------------------------------------------- |
| Single choice   | One point for the correct option                |
| Multiple choice | One point only for the exact correct option set |
| Text answer     | One point for an accepted normalized answer     |
| Gap question    | One point per correctly answered gap            |
| Matching        | One point per correctly matched pair            |

For text, ignore case and leading/trailing whitespace; allow author-defined alternative answers. Internal whitespace, punctuation and different apostrophe characters remain significant. For example, `don't` and `do not` are both accepted only if the author provides both alternatives. Do not automatically accept typos or introduce fuzzy scoring. Display percentages rounded to the nearest whole number (2/3 → 67%), retaining exact earned/maximum points. The contract proposes half-up rounding for exact ties. Unicode normalization and duplicate-equivalent answer policy remain O-10 decisions.

The [question contract proposal](QUESTION-CONTRACTS-learning.md) defines the five discriminated payloads, draft/publication validation, allowlisted player projections, answer snapshots, per-unit results and worked examples. Missing answers score zero; malformed input or foreign IDs are rejected rather than treated as wrong answers. Technical proposals within that document are not implicitly approved product restrictions.

The server evaluates against the attempt's fixed version. Public copying includes answer keys for authoring, so this is a learning tool, not a promise of high-stakes anti-cheating protection.

### FR-LEARN-010 — Authenticated attempts

One active unfinished attempt per user and test, shared across devices. Different tests can have active attempts simultaneously.

- Continue restores saved answers and the original test version.
- Start again requires confirmation, supersedes the unfinished attempt, and starts the current version.
- Publishing an ordinary update does not rewrite an existing attempt.
- Revocation or blocking stops access even when the attempt version is retained.
- Repeated submission after a network failure returns the same completed result rather than recording a second completion.

Retain an authenticated unfinished attempt for **14 days from its last activity**. After expiry, it cannot be continued: saved answers are cleared by cleanup and the user must start again. Retain a completed result for **3 days from submission** for reliable result retrieval/replay. Reading or retrying a completed result does not restart that three-day window. This does not introduce a personal history UI.

Check expiry during API access, not only when a cleanup job runs. An expired row waiting for cleanup cannot be resumed or block creation of a new active attempt. Cleanup removes personal answers/results without deleting versions or files still required by another attempt, publication, or independent copy.

The exact activity signal, cleanup cadence, receipt lifetimes, superseded-attempt retention, and result revisit UI remain implementation/policy details under O-01. Background polling must not silently keep an inactive attempt alive.

### FR-LEARN-011 — Guests

Guests may take accessible published tests and see results **only within the current open page**, without restoring a session after the page is closed. The authenticated 14-day/3-day retention windows do not grant guest restoration. No personal history or cross-device restoration is provided.

Guest authorization must protect each attempt; a freely supplied attempt ID is not enough. The server must bind evaluation to the version actually started and handle repeated submissions safely while the page is open. Browser-close events are not a reliable server cleanup signal: use a bounded technical expiry for abandoned guest data rather than promising immediate physical deletion on close. That expiry duration, capability storage and reload/navigation semantics remain O-02 details; they must not introduce persistent recovery after closure.

## 7. Platform moderation

### FR-LEARN-012 — Fixed roles and permissions

Platform roles are independent of organization roles. Enforce explicit permissions server-side per operation. No arbitrary role editor in v1.

Assign the **first platform administrator through an explicit seed operation**. Select the intended account explicitly; an organization `OWNER` is not automatically a platform administrator. Subsequent role assignments remain restricted to platform administrators and audited. Seed reruns must be idempotent and must not silently restore revoked privileges or promote demo accounts. Account-selection configuration, bootstrap safeguards and last-administrator protection remain O-03 details. This is a requirement for later seed implementation, not authorization to run a seed now.

| Capability                                                | Moderator                         | Senior moderator                  | Platform administrator           |
| --------------------------------------------------------- | --------------------------------- | --------------------------------- | -------------------------------- |
| Review public/unlisted content, including blocked content | Yes                               | Yes                               | Yes                              |
| Review private content                                    | No                                | No                                | Only with reason and audit entry |
| Block an individual test or topic with reason             | Within permitted moderation scope | Within permitted moderation scope | Yes                              |
| Block a test and its descendant copies                    | No                                | Yes                               | Yes                              |
| Unblock content                                           | No                                | Yes                               | Yes                              |
| Permanently delete content                                | No                                | No                                | Yes                              |
| Assign/revoke platform roles                              | No                                | No                                | Yes                              |

Bulk blocking is a permission to act on a lineage, not permission to inspect private descendant content. Preview must avoid disclosing private content to roles without that access. The exact safe impact-preview fields and mixed-visibility handling are part of O-07.

Record privileged actor, target, action, time, and reason, including role changes and private-content access. Do not put tokens, submitted learner answers, or full private content in operational logs.

### FR-LEARN-013 — Blocking and recovery

Blocking stops ordinary reading, taking, copying, editing, previewing, and publishing, including for the owner. An owner may see a blocked-status notice and reason, not the blocked content. A topic displays an explicit blocked-exercise notice instead of silently losing that position.

Authorized moderation access is a separate operation and permission; ownership alone cannot bypass blocking. A block does not widen permissions to view private content.

Support blocking just one test or that test and its descendant copies. Show impact before confirmation. Topic blocking denies access through that topic; it does not implicitly authorize a test-lineage cascade beyond the requested operation.

Block and permanent deletion are separate administrative actions. Retain blocked content for authorized review until a permitted deletion/retention policy applies. Owners cannot edit blocked drafts to repair them; an authorized moderator must restore access first. Unblocking one case must not cancel another independent block. Restoring an original does not automatically restore separately blocked copies.

Seed-based bootstrap is agreed. Its safeguards, role revocation/session behavior, and audit retention must be settled before moderation is enabled (O-03, O-07).

## 8. Non-functional and integration requirements

### Agreed v1 content limits

| Content                                            | Maximum / accepted formats                 |
| -------------------------------------------------- | ------------------------------------------ |
| Questions in one test, across all groups           | 100                                        |
| Groups in one test                                 | 20                                         |
| Options in a choice question or one selectable gap | 10                                         |
| Gaps in one question                               | 20                                         |
| Pairs in one matching question                     | 20                                         |
| Exercises in one topic                             | 50                                         |
| One uploaded image                                 | 5 MiB (5,242,880 bytes); JPEG, PNG or WebP |

Question count counts question blocks, not each gap/pair inside a block. The choice-option limit does not reduce matching's separate 20-pair limit. Apply limits to draft save, duplication, copying, publication and upload paths; incomplete drafts are allowed, unbounded drafts are not. Show limits in the editor and reject overflow explicitly without silently truncating content or claiming unsaved work was saved.

Keep the limits in centralized validated configuration and expose the effective constraints to the editor; the server remains authoritative. Validate image bytes/decoded format, not only the filename or browser-provided MIME type. Text/document length, image dimension/pixel count, images per resource, total request size and catalog metadata/filter limits remain open under O-04.

### Engineering requirements

- Domain logic does not depend on GraphQL, Prisma, rich-text editor libraries, or HTTP exceptions.
- Validate external inputs and stored versioned question payloads without blind casts or `any`.
- Use distinct allowlisted author/player/result projections. Matching player data must not expose correct pair mappings; rich-text metadata must not carry answer keys.
- Require operation-level authorization and bounded/paginated reads. Avoid N+1 query patterns and unbounded nested GraphQL requests.
- Protect publication, copy, deletion, role changes, and attempt submission against unsafe retries and concurrent updates.
- Copying and media cleanup must not race to remove referenced files. Blocking and copying must not permit an unblocked descendant to escape the chosen scope.
- Serve Learning media through access-controlled delivery, including private drafts and retained versions. Revocation prevents future authorized retrieval; it cannot erase content a viewer already downloaded.
- Reuse the existing session system; do not treat infrastructure errors as successful guest authentication.
- Frontend routes must not inherit the organization-required dashboard layout. Compose using existing FSD boundaries and shared UI where suitable.
- Keep existing REST behavior covered when adapting auth, CSRF, errors, session refresh, or storage integrations.

## 9. Acceptance scenarios from the independent review

These are required future checks, not evidence that implementation already passes.

| ID    | Given / When                                                             | Then                                                                                                                                                                                   |
| ----- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | Source test/account is deleted after a copy exists                       | Copy content/media remain usable under the copy's own access policy                                                                                                                    |
| AC-02 | Published exercise is removed only from draft                            | Current topic publication and its exercise remain available                                                                                                                            |
| AC-03 | Removal is published during another user's attempt                       | Copy becomes private; answers/version retained but access denied                                                                                                                       |
| AC-04 | Topic is deleted with keep/delete choice                                 | All affected owned exercises follow that choice; external originals/copies do not change                                                                                               |
| AC-05 | Visibility is reduced after load but before submit                       | Submission is denied; saved answers are not erased                                                                                                                                     |
| AC-06 | Publication races with an exercise autosave                              | One coherent revision publishes or a conflict is returned                                                                                                                              |
| AC-07 | Copying races with lineage blocking                                      | No descendant escapes the committed blocking policy                                                                                                                                    |
| AC-08 | Copying races with media cleanup                                         | No committed copy points at a deleted required file                                                                                                                                    |
| AC-09 | Same submission/publication operation is retried                         | Same result; no duplicate version, score, or side effect                                                                                                                               |
| AC-10 | Another device saves stale answers                                       | Newer answers are not silently overwritten                                                                                                                                             |
| AC-11 | A role without private-content permission reviews a blocked private copy | Content and protected media are denied; blocking did not expand reading rights                                                                                                         |
| AC-12 | Blocked owner tries edit/copy/preview/publish                            | Denied until permitted unblock; direct API access cannot bypass UI                                                                                                                     |
| AC-13 | One moderation case is lifted while another still applies                | Resource stays blocked                                                                                                                                                                 |
| AC-14 | Player data is inspected for every question type                         | No hidden keys, correct pair mapping, or answer-bearing metadata                                                                                                                       |
| AC-15 | Private/blocked media URL is requested directly                          | Current authorization is enforced; no public storage bypass                                                                                                                            |
| AC-16 | An authenticated unfinished attempt reaches 14 days since last activity  | Resume is denied and a new attempt can start even before cleanup; unrelated retained versions/media survive                                                                            |
| AC-17 | A completed result reaches 3 days since submission                       | Result replay no longer exposes that result; retries before expiry do not extend its lifetime or create another completion                                                             |
| AC-18 | A guest closes the page and later opens the test                         | Previous guest answers/result are not restored; abandoned server data is cleaned through bounded technical expiry                                                                      |
| AC-19 | A save/copy/duplicate/upload reaches or exceeds an agreed limit          | The maximum is accepted when otherwise valid; overflow is rejected on the server without partial writes or silent truncation                                                           |
| AC-20 | Bootstrap seed runs or reruns for an explicitly selected account         | Initial platform administrator assignment is controlled and idempotent; organization owners/demo accounts are not implicitly promoted and revoked privileges are not silently restored |

## 10. Open decisions and implementation gates

Open items are not approved defaults. Resolve each before its dependent implementation or release check; do not silently add product behavior.

| ID   | Decision                                                                                                                                                                                                                             | Gate                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| O-01 | 14-day unfinished / 3-day completed retention agreed; define activity signal, cleanup cadence, superseded attempts, result revisit UI, other receipt lifetimes and deleted-content cleanup                                           | Attempt lifecycle and cleanup |
| O-02 | Guest use until page closure agreed; define bounded server cleanup expiry, capability storage, reload/navigation behavior and resource bounds without closed-page recovery                                                           | Guest API                     |
| O-03 | First administrator via seed agreed; define account selection, idempotent bootstrap/revocation safeguards, later role management and last-admin protection                                                                           | Role management               |
| O-04 | Counts and image size/formats agreed in section 8; define remaining text/document, image dimension/count, total request and catalog/filter bounds                                                                                    | Validation and catalog        |
| O-05 | GraphQL server integration, code generation, rich-text editor, upload transport; dependency justification                                                                                                                            | Dependency/schema approval    |
| O-06 | View-count repeat semantics, prefetch/bot treatment, topic counter                                                                                                                                                                   | Analytics counter             |
| O-07 | Moderation impact preview, private descendants, role freshness, restore/delete semantics and evidence retention                                                                                                                      | Moderation                    |
| O-08 | Attribution after source account deletion and retained personal-data policy                                                                                                                                                          | Account deletion              |
| O-09 | Never-published exercise detachment; own draft source selection; discovery/copying of embedded exercises                                                                                                                             | Copy/remove UX                |
| O-10 | [Question contracts proposed](QUESTION-CONTRACTS-learning.md); text differences, whole percentages and one-to-one matching agreed; finalize Unicode/duplicate policy, publication minima, document/transport schemas and conflict UX | Builder/scoring contracts     |

## 11. Change and evidence policy

This documentation authorizes no migration, dependency addition/removal, infrastructure change, commit, or deployment. Present concrete schema and dependency proposals for approval before those actions.

Track unit/type/lint checks separately from PostgreSQL integration, browser/e2e, production builds, migrations, and release verification. No new Learning behavior is implemented or verified by this document.
