# Learning Tests and Topics — Feature Specification

- Version: v0.8
- Updated: 2026-10-12
- Status: Agreed product baseline; implementation details remain open
- Implementation: Not started
- Architecture: [ADR-0010](../../adr/0010-learning-tests-and-topics.md)
- Delivery: [Implementation plan](IMPLEMENTATION-PLAN-learning.md)
- Question contracts: [Author, player, answers and results](QUESTION-CONTRACTS-learning.md)
- Lifecycle contract: [States and operation authorization](STATE-AND-ACCESS-learning.md)

## 1. Purpose and scope

Add user-authored tests and topic pages to dash-stack. English exercises are the initial use case; question types and scoring must not depend on a particular subject. Registered users create standalone tests or topics containing independent exercise copies and explanatory materials. Guests can study accessible published content.

The new module uses GraphQL alongside existing REST. Preserve NestJS, Prisma, PostgreSQL, the current authentication/session system, backend Clean/Hexagonal Architecture, and frontend FSD. Organization membership is not a prerequisite.

This document records the latest agreed behavior, including decisions made after the independent requirements review. Earlier proposals for live references to source tests, separate visibility for embedded exercises, or author editing after moderation blocking are superseded.

### In v1

- Standalone tests, topic pages, author libraries, and separate Tests/Topics catalog tabs.
- A question builder, explicitly saved drafts, explicit publication, learner preview, and versioned attempts.
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

Agreed v1 editor capabilities: topic materials, question prompts, shared group text and explanations support paragraphs, headings, bold, italic, underline, lists, blockquotes, links and authorized images. Choice labels and matching-side labels support text plus bold/italic/underline only, without images, links or complex blocks. Titles, short descriptions and accepted text answers are plain text. Insert gap nodes through a dedicated editor action only in a GAPS question prompt. Tables, video, arbitrary HTML, text colors and font selection are deferred. Document schemas must enforce these field-specific capabilities server-side as well as in the editor.

In v1, gap nodes may appear inline in ordinary paragraphs or list-item paragraphs within a GAPS prompt, including multiple gaps in one sentence. Exclude gaps from headings, links, image captions and other gaps. Each gap has independent TEXT or SELECT answer configuration. Display numbering is derived from document order; moving a gap preserves its identity and solution. Deleting a gap removes its node, configuration and solution from local editor state together; persist only through explicit Save draft. Existing exactly-one-node/definition/solution validation still applies.

Ordinary clipboard paste (not a separate import feature) preserves text and only the formatting allowed by the destination field. Remove foreign styles/fonts, scripts and unsupported elements; notify the author when formatting is lost. Do not automatically embed or fetch external images; authors upload images separately through the authorized upload workflow. Pasted content remains local until explicit Save draft and can be checked in preview. Clipboard handling does not replace server-side document validation.

Rich-text links accept only validated absolute http:// or https:// web URLs, including links to platform tests/topics. External links open in a new tab with opener isolation. Do not generate automatic previews or fetch linked third-party content. Reject other URL schemes, including javascript:, file: and data:, at the document boundary. Platform links do not grant target access or restore guest attempts.

Confirm destructive local editor actions before deleting a populated question, deleting a populated group and its questions, or switching kind when existing configuration/solutions would be cleared. Describe the content that will be lost; cancellation changes nothing. Empty elements may be deleted without confirmation. Confirmed changes remain local until Save draft and never directly alter the published version. Confirmation is agreed; any additional undo behavior is not specified by this decision.

On a confirmed question-kind change, preserve the question prompt text, explanation, group membership and ordering. Reset all kind-specific configuration and solutions, including options, accepted answers, pairs and gaps, without automatic conversion even between single and multiple choice. Leaving GAPS removes gap nodes while preserving surrounding prompt text; disclose this in the confirmation. Returning to the old kind does not restore its former configuration. Apply the change locally until Save draft.

Duplicating editor elements creates independent element identifiers. Matching authors enter correct pairs; learners see shuffled choices. Shared reading material, topic theory, and post-submission answer explanations are separate concepts.

V1 preserves author order for groups, questions, single/multiple-choice options, selectable-gap options and matching's left-side elements. Shuffle only matching's right-side elements independently of the left side. Keep that presentation stable throughout the opening, retries and its submitted result. No additional shuffle settings are introduced in v1.

Matching uses equal left/right collections with a one-to-one correct mapping and no extra choices in v1. Publication rejects identical visible labels within either side; drafts preserve them for correction. The same label on opposite sides or in unrelated questions is allowed.

For duplicate visible choice/matching labels, ignore bold, italic, color and link formatting, leading/trailing whitespace and repeated ordinary spaces. Preserve case and punctuation; normalize canonically equivalent Unicode with NFC. This comparison is separate from text-answer scoring. Use the rendered-text extraction specified in section 8; enforce the field-specific non-text label restrictions during schema validation.

Acceptance:

- Given a mixed group, the author can add, duplicate, reorder, edit, and preview its questions without changing another question's answer keys.
- Given mixed gaps, each gap retains its own input mode and acceptable answer configuration across save/reload.
- Given an incomplete question, an explicit draft save preserves it; publication identifies the invalid question and field.

### FR-LEARN-002 — Drafts and publication

Save incomplete author drafts only after an explicit “Save draft” action; no author-draft autosave in v1. Do not expose unpublished content to visitors. Publishing requires valid content; one invalid included exercise prevents publication of the entire topic change.

Publication requires at least two options for single/multiple-choice questions and selectable gaps, two pairs for matching, and one gap for a gap question. Explicit draft saving still accepts incomplete content below those minima. Within each accepted-text answer list, flag normalized duplicates and require the author to remove them before publication; do not silently deduplicate saved drafts.

Identical visible options within one choice question or selectable gap block publication, even if their IDs differ. Preserve them in drafts and show which options must be changed or removed. Reusing a label in another question is allowed.

A standalone test is published independently. A topic has one publication action covering its materials, exercise order, additions/removals, and exercise content changes. Embedded exercises must not bypass topic publication through a standalone publish operation.

Saving and publishing are separate actions. Publish only a previously saved valid draft; if the current editor has unsaved changes, ask the author to save first. Do not implicitly save as part of publication. This applies to test/question content and topic materials/order/composition. The publication still checks its expected server revision.

Detect concurrent edits rather than silently overwriting newer work. Display unsaved, saving, saved, failed, and conflict states accurately. If a save conflicts, reject the stale write, retain local input in that tab and offer loading the latest server draft with a discard warning. No automatic merge or force overwrite in v1. Publication stays unavailable while dirty, saving or conflicted. Preserve local inputs on network failure too; do not claim success before server acknowledgment.

Warn when leaving, reloading or closing an editor with unsaved changes, using an in-app confirmation for app navigation and the browser's supported unload prompt elsewhere. A browser warning cannot guarantee recovery after a crash or forced close. Unsaved edits remain in the current tab only; no persistent local draft-recovery feature is introduced. Learner answers use the separately agreed submit-only persistence policy.

Acceptance:

- Given an existing publication, editing its draft leaves visitor content unchanged.
- Given a failed topic publication, visitors see the complete previous publication, not a partial update.
- Given a stale explicit draft save, newer content is preserved and the author receives a conflict.

### FR-LEARN-003 — Topics and materials

Topic pages provide Exercises and Materials tabs. Exercises are ordered, independently submitted tests, such as Exercise 1/2/3. Each exercise displays all its groups/questions on one page. Materials support headings, basic formatting, links, images, and captions.

Text is the initial implementation slice; images remain required for the completed v1. Audio is excluded. An uploaded image in a private draft must not become publicly accessible merely because its storage URL is known.

## 4. Copying and catalog

### FR-LEARN-004 — Independent copies

Adding an existing test to a topic always creates an independent copy, including when the source belongs to the topic owner. Authors can select their own tests and other authors' public tests. Public authors cannot disable copying; publication explains this behavior.

Copy questions, materials, answer keys, explanations, scoring configuration, and references sufficient to retain all required files independently. Do not copy attempts, results, or view counts. Record attribution and source provenance. Source changes, visibility changes, deletion, or source account deletion do not change the copy.

An owner may copy their own unpublished test into a topic using its current draft snapshot, including incomplete content. For their own published test, offer an explicit choice between the current published version (default) and the current draft. The independent copy remains editable, but cannot be published until valid. Another author's public test can be copied only from its current published version; their draft/private content is never a source.

Provide “Add to my topic” on an exercise page of an accessible public topic. A registered caller selects their own writable destination topic and receives an independent exercise copy. Use the version referenced by the current source topic publication, not its unpublished exercise draft. Recheck source/destination access and the selected snapshot during copying. These source-selection rules close O-09; exact picker layout and transport names remain implementation details.

Acceptance:

- Given a published source copied into a topic, later deleting the source or its owner's account does not remove copied content or media.
- Given an edited copy, neither its source nor other copies change.
- Given a deleted source, lineage still permits discovery of descendant copies for authorized moderation.

### FR-LEARN-005 — Discovery and view counts

Provide separate Tests and Topics catalog tabs. Embedded copies do not appear as separate catalog cards. Paginate catalogs and author libraries.

For the v1 public Tests/Topics catalogs, search titles and short descriptions only, excluding question bodies and topic materials. Include only accessible public published resources, excluding blocked/deleted resources and embedded duplicate cards. Offer an optional English level filter A1–C2 or “No level”. Offer sorting by newest, most views and title. Default newest uses first-publication time; subsequent edits/republication do not bump the resource. Level is optional English-specific metadata, not a requirement for every future test type. Catalog search accepts at most 200 characters with no minimum length; match a case-insensitive literal substring in title or short description. An empty query lists all eligible resources under the selected filters. Default page size is 20; the server accepts at most 50 resources per page request. Keep search, level, sorting and page in URL state; changes to search/filter/sort reset page to one. Stable tie-breaking and exact collation/character counting remain technical contract details.

Count each successful ordinary learner opening of an accessible published test, including guests, as one view. Reload or a subsequent navigation to the test creates another opening; retries within the same opening must not increment again. Exclude prefetches, author previews, moderation views, access-denied requests and known bots. This is an opening counter, not a unique-person metric or a guarantee that all bots are detected. Do not equate server fetches with page openings. Starts and completions analytics are not required. Topics have independent view counters under the same opening/reload/retry/exclusion rules. Opening a topic increments only its topic counter. Switching between its materials/exercises tabs within that opening does not increment again. Opening a specific exercise increments its test counter, not an additional topic view; do not sum exercise views into the topic counter. Concrete opening identity and bot-filter implementation remain transport details under O-06.

## 5. Access and lifecycle

### FR-LEARN-006 — Visibility

| Visibility         | Ordinary published access                        |
| ------------------ | ------------------------------------------------ |
| Private            | Owner only                                       |
| Unlisted / by link | Anyone with the link; absent from public catalog |
| Public             | Anyone; discoverable in public catalog           |

An embedded exercise inherits topic access, without its own visibility selector. Drafts remain owner-only regardless of the eventual publication's visibility, subject to explicitly authorized moderation access.

Visibility changes take effect immediately through a separate action. They do not publish drafts. Making a resource visible exposes only already-published content; a draft without a publication does not become playable.

Recheck current access on result reads, submissions, copy operations, and media delivery. A saved version does not override revoked access. Revocation stops ordinary access without clearing tab-local answers; restoration never bypasses current access.

### FR-LEARN-007 — Exercise removal

| Operation/state                                      | Visitor behavior                                            | Owner behavior                               |
| ---------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| New exercise exists only in draft                    | No visitor access                                           | Can edit/preview                             |
| Published exercise is removed from draft             | Remains in current publication                              | Sees pending removal                         |
| Removal is published                                 | Exercise disappears from the topic                          | Copy becomes a private standalone test       |
| Removed copy is open in another learner tab          | Submission/access denied; local inputs are not server-saved | Owner still has the private copy             |
| Ordinary edit is published without access revocation | Started attempts retain their original questions            | New starts use the latest applicable version |

An individual test used in a current topic publication cannot be permanently deleted before its removal is published. Topic/account deletion and privileged deletion are separate coordinated operations, not an accidental cascade through this guard.

For an exercise never published, offer a choice: immediately keep it as a private standalone test or logically delete the owned copy. Both choices remove it from the topic draft without changing the visitor publication or its source/independent copies. Recheck the never-published state together with the topic revision so concurrent publication cannot turn this into deletion of a published exercise.

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

A blocked topic can also be deleted immediately by its owner through a metadata-only action, without moderator approval or a new automatic review. Keep the same keep/delete exercise choice. Kept exercises become private standalone tests but retain all effective blocks inherited from the deleted topic as well as their own blocks. Deleted exercises remain inaccessible with required restrictions/evidence retained. Deletion must not expose blocked content or affect independent copies outside the topic.

Deleting an account removes that account's own tests/topics from access, but not independent copies owned by others. Logical removal, physical cleanup, and retained moderation evidence are distinct. Apply the agreed Learning account-erasure, deleted-source attribution and moderation-evidence policies below.

## 6. Taking and scoring tests

### FR-LEARN-009 — Submission and scoring

Allow answer changes until whole-test submission. Do not reveal correct answers or correctness feedback during the attempt. After submission show total score, correct answers, and author explanations. Skipped answers are incorrect without an additional confirmation dialog. Retakes are unlimited.

V1 explanations are optional and question-level only. Show the shared question explanation after submission for correct, incorrect and unanswered responses. A GAPS or MATCHING question has one explanation for all its units while correctness/scoring remains per gap or left-side pair. Per-option, per-gap and per-pair explanation fields are deferred.

| Type            | Evaluation                                      |
| --------------- | ----------------------------------------------- |
| Single choice   | One point for the correct option                |
| Multiple choice | One point only for the exact correct option set |
| Text answer     | One point for an accepted normalized answer     |
| Gap question    | One point per correctly answered gap            |
| Matching        | One point per correctly matched pair            |

For text, ignore case and leading/trailing whitespace; allow author-defined alternative answers. Canonically equivalent Unicode letters compare equally through NFC normalization, so composed `é` and `e` plus a combining acute accent match; plain `e` does not. Apply NFC, trim, locale-independent lowercase, then NFC again to both input and accepted alternatives. Internal whitespace, punctuation and different apostrophe characters remain significant. For example, `don't` and `do not` are both accepted only if the author provides both alternatives. Do not automatically accept typos or introduce fuzzy scoring. Normalized duplicate accepted alternatives, such as `"Will"` and `" will "`, must be corrected before publication while drafts remain saveable. Display percentages rounded to the nearest whole number (2/3 → 67%), retaining exact earned/maximum points. The contract proposes half-up rounding for exact ties.

The [question contract proposal](QUESTION-CONTRACTS-learning.md) defines the five discriminated payloads, draft/publication validation, allowlisted player projections, answer snapshots, per-unit results and worked examples. Missing answers score zero; malformed input or foreign IDs are rejected rather than treated as wrong answers. Technical proposals within that document are not implicitly approved product restrictions.

The server evaluates against the attempt's fixed version. Public copying includes answer keys for authoring, so this is a learning tool, not a promise of high-stakes anti-cheating protection.

### FR-LEARN-010 — Authenticated attempts

Create a completed attempt only on successful whole-test submission. Before submission, answers exist only in the current tab: no server answer saves, active-attempt rows, cross-device recovery or learner-save conflicts. Each tab is independent. Opening returns an authorized server-verifiable binding to the displayed immutable content/scoring version without creating an attempt. Submit all current answers and that binding; recheck current access and atomically validate, evaluate, persist the completed attempt/result and minimal operation receipt. Failed submission preserves local answers and creates no partial attempt. Warn before leaving with unsubmitted answers; closing/reloading loses them. Local “Start again” confirms clearing local inputs rather than superseding server state. Retain authenticated results for three days from submission, without renewal on reads/retries. Repeat of the same submit operation cannot create another completion. The former 14-day unfinished retention and one-active-attempt constraints are superseded.

Authenticated submitted results have a dedicated revisit link and survive page reload while within three days of submission and currently authorized. The test page offers “View latest result” for the latest submitted attempt while it is eligible. A new attempt neither deletes prior retained results nor renews their deadlines. After expiry, an authorized owner opening that result link sees an expiry message and a link back to the test, without answers or scores; denied access must not expose result metadata. No all-attempt history or best-result UI in v1. Guests retain results only within the current open page.

Expired results are denied on access and removed by hourly cleanup; cleanup failures are reported and retried. Preserve versions/media still needed by valid references.

Retain minimal successful-operation receipts for 12 hours from commit, without answer bodies or authored content. Signed operation tickets admit a request for 12 hours; a committed receipt permits authorized replay for 12 hours from commit. Replays do not renew either deadline or extend result retention. Recheck current access before retrieving the referenced result. A changed payload conflicts. If admission expires without a receipt, or the receipt expires, reject without re-execution.

The authorized open-page version binding expires 24 hours after opening for both registered users and guests, without renewal by typing, polling or retries. Retain its immutable version/media for the eligible binding lifetime without storing pre-submit answers or an attempt. Submission within the window evaluates the bound version despite ordinary republication; current access/block/deletion checks still prevail. After expiry require reopening the test and warn that the old page can no longer submit. Guest completed results expire 24 hours after successful submission, without renewal on reads/retries, and are accessible only through the same open page. Close/reload/leave loses access with no restoration. Current blocking/visibility/deletion checks may deny access earlier. Enforce expiry before hourly cleanup removes answers/results. This result clock is independent of the 24-hour opening-to-submission binding clock; successful submission must authorize page-only result access without silently extending the submission binding.

### FR-LEARN-011 — Guests

Guests may take accessible published tests and see results **only within the current open page**. Closing, reloading or leaving the test discards the current guest answers/result; returning starts fresh. Signing in does not transfer guest answers to the account. Warn about losing the guest attempt before initiating sign-in. Authenticated result retention do not grant guest restoration. No personal history or cross-device restoration is provided.

Each guest page/tab has independent local answers and creates an attempt only upon submission, with no cross-tab answer/result synchronization. Opening the same test in another tab creates independent local page state without changing the earlier page. A test URL or attempt ID alone grants no answer access; require the page-bound guest capability. Closing/reloading/leaving a page never enables restoring its attempt from another tab. Capability transport must preserve these semantics without persistent browser recovery.

Guest authorization must protect each attempt; a freely supplied attempt ID is not enough. The server must bind evaluation to the version actually started and handle repeated submissions safely while the page is open. The guest opening binding expires **24 hours from opening** and is removed by cleanup; that retention does not enable recovery after reload, leaving or closure. Enforce expiry on access even before cleanup runs. Browser-close events are not a reliable server cleanup signal, so do not promise immediate physical deletion on close. For retry after a lost response, use a signed ticket binding principal, operation, resource, nonce, canonical payload hash, issue time, admission deadline and key version. Derive opening and result capabilities with separate HMAC domains; store only hashes. The same ticket may recover the same capability during its admission/receipt windows; another ticket cannot. Keep capabilities in page memory only, not durable browser storage. Ticket admission and receipt replay windows are each 12 hours; expired operations are never re-executed. These semantics are agreed; implementation and verification remain. Polling must not keep abandoned data alive.

After a source author deletes their account, independently owned copies remain usable under their own access/restriction rules. Render source attribution as “Deleted user” without an avatar or profile link, and remove stored source-author display-name snapshots from provenance metadata. Retain only the technical source/lineage relationships required for copy tracking and lineage restrictions; do not expose deleted profile data through those relationships. Do not automatically rewrite text the author explicitly authored inside copied test content.

On confirmed account deletion, immediately deny access to all of that user’s Learning attempt answers/results and remove them on the next successful hourly cleanup, without waiting for the normal three-day result deadline. Preserve open moderation cases and active restrictions. Required technical/audit records retain only an opaque deleted-account identifier, not name, email or avatar; identifier retention follows the relevant record lifecycle. Existing audit records expire at their original one-year deadlines, without renewal from account deletion. This is the Learning policy; integration with the repository-wide account deletion workflow requires separate verification.

## 7. Platform moderation

### FR-LEARN-012 — Fixed roles and permissions

Platform roles are independent of organization roles. Enforce explicit permissions server-side per operation. No arbitrary role editor in v1.

V1 platform role management is administrator-only and targets existing registered accounts. Each account has at most one platform role: moderator, senior moderator or platform administrator; changing role replaces the prior role and revocation restores ordinary-user permissions. Assignment/change/revocation require confirmation and a reason, with atomic audit recording. Moderators cannot manage roles; administrators cannot self-elevate or bypass last-active-administrator protection. Arbitrary permission sets and custom roles are deferred. Existing immediate revocation and organization-role separation apply.

Assign the **first platform administrator through an explicit seed operation**. Select the intended account explicitly; an organization `OWNER` is not automatically a platform administrator. Subsequent role assignments remain restricted to platform administrators and audited. Seed reruns must be idempotent and must not silently restore revoked privileges or promote demo accounts. Last-active-administrator protection is agreed. Existing-account ID selection and one-time bootstrap safeguards are agreed. This is a requirement for later seed implementation, not authorization to run a seed now.

Bootstrap the first platform administrator by explicitly configuring the ID of an existing registered account. Do not create an account or auto-select the first user, an organization owner or a demo account. Atomically record one-time bootstrap completion and the audited assignment. Reruns with the same configured ID make no assignment changes; a different ID after completion fails explicitly rather than assigning another administrator. A completed bootstrap never restores a subsequently revoked role. Later administrators are assigned by a currently authorized platform administrator. Reject missing/invalid account selection before any assignment. This documents the proposed seed behavior and does not authorize running it.

Prevent any role removal/demotion, account deletion or deactivation that would leave no active platform administrator, including self-service deletion. Require another active administrator first. Enforce the invariant atomically across concurrent role and account-lifecycle operations so two administrators cannot simultaneously remove the last effective administrators.

| Capability                                                | Moderator                         | Senior moderator                  | Platform administrator           |
| --------------------------------------------------------- | --------------------------------- | --------------------------------- | -------------------------------- |
| Review public/unlisted content, including blocked content | Yes                               | Yes                               | Yes                              |
| Review private content                                    | No                                | No                                | Only with reason and audit entry |
| Block an individual test or topic with reason             | Within permitted moderation scope | Within permitted moderation scope | Yes                              |
| Block a test and its descendant copies                    | No                                | Yes                               | Yes                              |
| Unblock content                                           | No                                | Yes                               | Yes                              |
| Permanently delete content                                | No                                | No                                | Yes                              |
| Assign/revoke platform roles                              | No                                | No                                | Yes                              |

Unpublished content is visible only to its author under ordinary owner authorization; no platform role, including administrator, grants draft review access. Moderation reviews published versions only, subject to visibility permissions. Private-content review permission never includes unpublished drafts. Blocking may deny the author access but never grants staff draft access.

No moderator, senior moderator or platform administrator may adjudicate a moderation case concerning their own test/topic, lift its restrictions or close its complaint. Another independently authorized staff member must handle the case; there is no administrator override for self-moderation. This does not prevent ordinary permitted owner lifecycle actions such as metadata-only deletion.

Bulk blocking is a permission to act on a lineage, not permission to inspect private descendant content. Preview must avoid disclosing private content to roles without that access. Lineage-block preview shows the total affected test count. For published tests the staff member is authorized to inspect, show title, author and status. Private tests without review permission and unpublished copies contribute only aggregate counts, with no titles, authors or content. Draft confidentiality applies even to administrators. If lineage membership changes after preview, reject the stale confirmation and require a refreshed preview and confirmation. Apply existing self-moderation exclusions without granting access to hidden targets.

Platform role changes/revocation take effect immediately across devices for subsequent privileged operations. Check current permissions for every moderation read and write, including protected-content retrieval; stale sessions or an open page do not preserve privileges. On denial, the UI closes privileged access while preserving the ordinary authenticated session and eligible normal features. Coordinate revocation and privileged mutations transactionally: a mutation committed before revocation remains valid; after revocation commits, no newly authorized privileged mutation may commit using the old role. Previously delivered browser content cannot be retracted.

Record privileged actor, target, action, time, and reason, including role changes and private-content access. Do not put tokens, submitted learner answers, or full private content in operational logs.

### FR-LEARN-013 — Blocking and recovery

Blocking stops ordinary reading, taking, copying, editing, previewing, and publishing, including for the owner. An owner may see a blocked-status notice and reason, not the blocked content. A topic displays an explicit blocked-exercise notice instead of silently losing that position.

Authorized moderation access is a separate operation and permission; ownership alone cannot bypass blocking. A block does not widen permissions to view private content.

Support blocking just one test or that test and its descendant copies. Show impact before confirmation. Topic blocking denies access through that topic; it does not implicitly authorize a test-lineage cascade beyond the requested operation.

Block and permanent deletion are separate administrative actions. Retain blocked content for authorized review until a permitted deletion/retention policy applies. Owners cannot edit blocked drafts to repair them; an authorized moderator must restore access first. Unblocking one case must not cancel another independent block. Restoring an original does not automatically restore separately blocked copies.

Reject topic publication while its desired draft composition contains a blocked exercise; identify the entry using safe metadata without exposing blocked content. The author may exclude it through metadata-only draft composition changes and publish the remaining valid content, provided the topic itself is writable and unblocked. Already-published blocked exercises become unavailable immediately while other accessible exercises/materials remain usable if the topic is not blocked. Exclusion/detachment never lifts the test restriction.

An owner may logically delete an eligible blocked test through a metadata-only action: remove it from their library and ordinary access without reading its content or erasing active restrictions/required moderation evidence. The existing guard for currently published embedded exercises still applies. This is distinct from administrator-only permanent deletion, and later unblocking does not undo deletion. Blocked-topic deletion follows FR-LEARN-008 without moderator approval. When keeping exercises, preserve each active topic case ID on each kept exercise before detaching it; lifting that case clears its propagated targets while separate test cases remain. Implement this with atomic propagation and authorized evidence retention.

For owner-deleted content with an open moderation case or an active restriction, retain the published version under review for authorized moderation access. Enforce the existing role/visibility permissions and self-moderation exclusion; unpublished drafts remain inaccessible to all staff. Owner deletion neither closes the case nor lifts restrictions. Without a case or active restriction, do not create a separate moderation-only content copy; other publication/copy/attempt references retain their own lifecycle rules. Retain moderation-only published evidence for 30 days after the case is closed and all related restrictions are lifted, measured from the later event. While any related case is open or restriction remains active, the evidence remains retained. Reopening a case or applying a related restriction before cleanup suspends evidence expiry. After the eligible 30-day window, remove the moderation-only reference/copy through reference-aware cleanup; do not delete content still needed by publications, attempts or independent copies. Retain minimal moderation/role-action audit records for one year from the action timestamp. Store only actor/target/case identifiers, action, time and reason; no test content, drafts or learner answers. Platform administrators alone may view this audit through authorized operations. Records are immutable to users/staff; lifecycle cleanup removes expired records rather than allowing edits. Active restrictions and required case state have a separate lifecycle and are never lifted by audit cleanup. Account deletion removes profile fields from retained Learning identity metadata while preserving only required opaque identifiers under the agreed record deadlines.

Seed-based bootstrap is agreed. One-year minimal audit retention is agreed. Immediate role revocation with ordinary-session preservation is agreed. Existing-account ID and one-time audited bootstrap safeguards are agreed; remaining role-management UX and concrete concurrency/storage design must be finalized before moderation is enabled (O-03, O-07).

## 8. Non-functional and integration requirements

### Agreed v1 content limits

| Content                                            | Maximum / accepted formats                                |
| -------------------------------------------------- | --------------------------------------------------------- |
| Questions in one test, across all groups           | 100                                                       |
| Groups in one test                                 | 20                                                        |
| Options in a choice question or one selectable gap | 10                                                        |
| Gaps in one question                               | 20                                                        |
| Pairs in one matching question                     | 20                                                        |
| Exercises in one topic                             | 50                                                        |
| Test/topic title                                   | 200 visible characters                                    |
| Short description                                  | 2,000 visible characters                                  |
| Question text                                      | 10,000 visible characters                                 |
| Shared group text                                  | 30,000 visible characters                                 |
| Answer explanation                                 | 10,000 visible characters                                 |
| One choice option or matching element              | 1,000 visible characters                                  |
| One text answer                                    | 500 characters                                            |
| Topic materials                                    | 100,000 visible characters                                |
| One uploaded image                                 | 5 MiB (5,242,880 bytes); JPEG, PNG or WebP                |
| Decoded image dimensions                           | At most 4,096 pixels per side and 16,000,000 pixels total |
| Image insertions in one test                       | 50 across questions, groups and explanations              |
| Image insertions in topic materials                | 50; exercise images count toward their respective tests   |

| One serialized rich-text document | 1 MiB (1,048,576 UTF-8 bytes) |
| Complete test/topic draft-save request | 10 MiB (10,485,760 bytes), including all fields |

Question count counts question blocks, not each gap/pair inside a block. The choice-option limit does not reduce matching's separate 20-pair limit. Apply limits to draft save, duplication, copying, publication and upload paths; incomplete drafts are allowed, unbounded drafts are not. Image counts measure insertions in the current content, including repeated uses of the same asset; historical published versions do not consume the current-content limit. Show limits in the editor and reject overflow explicitly without silently truncating content or claiming unsaved work was saved.

Keep the limits in centralized validated configuration and expose the effective constraints to the editor; the server remains authoritative. Validate image bytes/decoded format, not only the filename or browser-provided MIME type. The agreed text limits apply to visible text in formatted content; serialized editor-document size is bounded separately. Count user-perceived characters (extended grapheme clusters) consistently in client and server: a composed/decomposed accented letter or multi-code-point emoji counts as one; spaces and line breaks count. Extract text in rendered document order: inline formatting and link marks add nothing; inline text concatenates; each explicit hard break adds one `\n`; adjacent rendered block children (including paragraphs, headings, list items, blockquote contents and figure captions) are separated by exactly one `\n`, with nested containers not adding duplicate separators. Do not trim extracted text. Figure asset IDs/bytes, gap IDs, numbering and other structural metadata add no visible characters; captions do. Count graphemes in that extracted string, using the same versioned extractor on client and server. Formatting metadata and link destinations remain bounded by serialized-document size; images use their separate insertion limit. Catalog search/page and document/draft-save request bounds are agreed. Upload images separately; documents contain authorized asset references, not embedded image bytes. Reject oversized requests/documents without truncation or partial writes. Remaining proposed schema, field-specific limits and transport/metadata bounds require engineering review under O-04/O-05.

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
| AC-03 | Removal is published during another user's attempt                       | Copy becomes private; Local answers remain in the tab but submission/access is denied                                                                                                  |
| AC-04 | Topic is deleted with keep/delete choice                                 | All affected owned exercises follow that choice; external originals/copies do not change                                                                                               |
| AC-05 | Visibility is reduced after load but before submit                       | Submission is denied; no attempt is created and tab-local answers are not submitted                                                                                                    |
| AC-06 | Publication races with an explicit exercise draft save                   | One coherent revision publishes or a conflict is returned                                                                                                                              |
| AC-07 | Copying races with lineage blocking                                      | No descendant escapes the committed blocking policy                                                                                                                                    |
| AC-08 | Copying races with media cleanup                                         | No committed copy points at a deleted required file                                                                                                                                    |
| AC-09 | Same submission/publication operation is retried                         | Same result; no duplicate version, score, or side effect                                                                                                                               |
| AC-10 | Two tabs independently submit answers                                    | Independent operations create separate completed attempts; repeats of one operation do not duplicate completion                                                                        |
| AC-11 | A role without private-content permission reviews a blocked private copy | Content and protected media are denied; blocking did not expand reading rights                                                                                                         |
| AC-12 | Blocked owner tries edit/copy/preview/publish                            | Denied until permitted unblock; direct API access cannot bypass UI                                                                                                                     |
| AC-13 | One moderation case is lifted while another still applies                | Resource stays blocked                                                                                                                                                                 |
| AC-14 | Player data is inspected for every question type                         | No hidden keys, correct pair mapping, or answer-bearing metadata                                                                                                                       |
| AC-15 | Private/blocked media URL is requested directly                          | Current authorization is enforced; no public storage bypass                                                                                                                            |
| AC-16 | A learner changes answers before submission                              | No server attempt or answers exist; reload loses local inputs; successful submit creates the completed attempt                                                                         |
| AC-17 | A completed result reaches 3 days since submission                       | Result replay no longer exposes that result; retries before expiry do not extend its lifetime or create another completion                                                             |
| AC-18 | A guest closes the page and later opens the test                         | Previous guest answers/result are not restored; abandoned server data is cleaned through bounded technical expiry                                                                      |
| AC-19 | A save/copy/duplicate/upload reaches or exceeds an agreed limit          | The maximum is accepted when otherwise valid; overflow is rejected on the server without partial writes or silent truncation                                                           |
| AC-20 | Bootstrap seed runs or reruns for an explicitly selected account         | Initial platform administrator assignment is controlled and idempotent; organization owners/demo accounts are not implicitly promoted and revoked privileges are not silently restored |

## 10. Decision register and remaining implementation gates

Resolved entries remain for traceability. Open items are not approved defaults; resolve each before its dependent implementation or release check and do not silently add product behavior. Agreed product rules do not need to be asked again. Engineering work and schema/dependency approval are tracked separately in the [implementation handoff](IMPLEMENTATION-HANDOFF-learning.md).

| ID   | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Gate                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| O-01 | Submit-only creation, local answers and three-day result retention agreed; unfinished retention/active uniqueness superseded; result revisit UI agreed; hourly cleanup agreed; 12-hour admission and receipt replay windows and same-ticket idempotency agreed; implement replay enforcement and deleted-content cleanup                                                                                                                                                                                                                                                                                                    | Attempt lifecycle and cleanup             |
| O-02 | Guest reset on close/reload/leave, sign-in warning with no answer transfer and 24-hour fixed opening-binding expiry and 24-hour post-submit guest results agreed; pre-submit answers remain local; hourly cleanup and signed-ticket/HMAC capability derivation with no durable browser storage agreed; implement delivery, enforcement and resource bounds                                                                                                                                                                                                                                                                  | Guest API                                 |
| O-03 | First administrator via seed agreed; last-active-admin protection agreed; existing-account ID and one-time audited bootstrap/revocation safeguards agreed; single-role administrator-only management with confirmation/reason agreed; finalize implementation contracts                                                                                                                                                                                                                                                                                                                                                     | Role management                           |
| O-04 | Counts, visible-text lengths and image size/formats/dimensions/insertion limits agreed in section 8; catalog search/page bounds agreed; 1 MiB/document and 10 MiB/full draft-save request agreed; user-perceived character counting and rendered-text extraction/separators agreed; review proposed node schema and remaining transport/metadata bounds                                                                                                                                                                                                                                                                     | Validation and catalog                    |
| O-05 | GraphQL server integration, code generation, rich-text editor, upload transport; dependency justification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Dependency/schema approval                |
| O-06 | Test opening/reload counting, per-opening retry deduplication and preview/moderation/prefetch/known-bot exclusions agreed; independent topic/exercise counters agreed; finalize opening identity/bot filtering                                                                                                                                                                                                                                                                                                                                                                                                              | Analytics counter                         |
| O-07 | Blocked-test/topic owner deletion without moderator approval agreed; kept exercises inherit active topic case IDs and lifting that case clears only propagated targets; independent test cases remain; blocked-composition publication rejection agreed; draft access denied for all staff and self-moderation prohibited; published evidence retention for open cases/active blocks agreed; 30-day post-case evidence retention agreed; one-year immutable administrator-only audit agreed; immediate role freshness/revocation and safe aggregate-only hidden-target preview agreed; verify transaction locking and races | Moderation                                |
| O-08 | Resolved at product level: deleted-user source attribution; immediate attempt denial and hourly erasure; opaque required identity metadata without profile fields; unchanged audit deadlines. Verify integration with account deletion                                                                                                                                                                                                                                                                                                                                                                                      | Account deletion                          |
| O-09 | Resolved: never-published removal keep/delete; own draft or publication source (publication default); other authors' published public sources only; copying from public topic exercise pages                                                                                                                                                                                                                                                                                                                                                                                                                                | Copy/remove UX — product decisions closed |
| O-10 | Text normalization, duplicate accepted-answer policy, identical visible choice and matching-side label rejection, publication minima, whole percentages and one-to-one matching agreed; visible-text label comparison agreed; rendered-text extraction and author ordering with matching-right-only shuffle agreed; review field-specific schemas and transport budgets in the schema proposal section 14; author manual-save agreed; learner-save conflicts superseded by submit-only persistence                                                                                                                          | Builder/scoring contracts                 |

## 11. Change and evidence policy

This documentation authorizes no migration, dependency addition/removal, infrastructure change, commit, or deployment. Present concrete schema and dependency proposals for approval before those actions.

Track unit/type/lint checks separately from PostgreSQL integration, browser/e2e, production builds, migrations, and release verification. No new Learning behavior is implemented or verified by this document.
