
# Vocabulary & SRS — Implementation and Remediation Plan

> **Status:** In progress — Phase 7 is next  
> **Created:** 2026-09-04  
> **Scope:** completion and hardening of the Vocabulary & SRS epic  
> **Source specification:** [FEATURE-SPEC-vocabulary.md](./FEATURE-SPEC-vocabulary.md)  
> **Original backlog:** [BACKLOG-vocabulary.md](./BACKLOG-vocabulary.md)  
> **Architecture decision:** [ADR-001](./decisions/ADR-001-vocabulary-architecture.md)

---

## 1. Goal

Bring the Vocabulary & SRS module to a production-ready state by:

- fixing critical access-control, data-safety, and persistence defects;
- completing partially implemented study modes and catalog features;
- adding the missing Match backend and Import/Export functionality;
- aligning the implementation, specification, and Trello acceptance criteria;
- adding integration and end-to-end coverage for the main user flows.

This document is the execution plan created after comparing the current code,
the files under `docs/specs/vocabulary`, and the Trello board. It does not
replace the feature specification or the original product backlog.

---

## 2. Delivery principles

1. Security and data integrity are completed before new feature work.
2. Backend contracts are finalized before dependent frontend work.
3. Every phase must include tests and migrations where applicable.
4. A Trello card moves to `Done` only after all of its acceptance criteria pass.
5. Public Vocabulary flows must not depend on Organization membership.
6. Multi-record writes must be atomic when partial success would corrupt user data.

### Approved implementation decisions

- Learn uses a two-step mastery contract per card: a correct MCQ answer opens
  written typing for the same card; a correct typing answer marks it mastered.
  A wrong answer resets the streak. Selections that cannot form four unique
  MCQ options use typing-only and require two consecutive correct answers.
- Learn code is grouped by responsibility inside the `study-vocab` feature:
  `model/learn/session`, `model/learn/answer`, and
  `model/learn/interaction`; adaptive presentation is in
  `ui/learn/adaptive`. Presentation contracts live in `model`, never in `ui`.
- `shared/lib/hooks/use-speech` is the sole Web Speech API adapter. It owns
  English voice resolution and fallback, availability, cleanup, and
  keyed one-time speech. A study mode supplies the trigger and text; it must
  not create a mode-specific speech hook.

---

## 3. Execution order

```text
Specification and contracts
        ↓
Access architecture
        ↓
Data safety and lifecycle
        ↓
Atomic deck editor and reorder
        ↓
SRS and due-review hardening
        ↓
Match backend and leaderboard
        ↓
Adaptive Learn mode
        ↓
Flashcards mode completion
        ↓
Catalog, fork, and images
        ↓
Starred study and Import/Export
        ↓
Integration, E2E, and release verification
```

---

## 4. Phase 0 — Align specification and API contracts

**Priority:** P0  
**Blocks:** all implementation phases

### Work

- Correct the epic estimate: the current task breakdown totals **49 SP**, not 48 SP.
- Resolve the Practice Test scope contradiction:
  - either explicitly keep it in Phase 1.5 and change the MVP wording to three modes;
  - or add a separate implementation task with acceptance criteria and estimate.
- Add a dedicated Match backend/leaderboard task to the backlog and Trello.
- Define the permitted Deck lifecycle transitions and their error responses.
- Define whether `DRAFT` and `ARCHIVED` decks may be studied by direct link.
- Define exact `UNLISTED` access rules for guests and authenticated users.
- Define the meaning of `due` for cards without an existing progress row.
- Resolve SRS status semantics for an incorrect answer in boxes 1 and 2.
- Decide whether Platform Admin moderation is part of this release.
- Standardize the Unsplash proxy route (`/images/search` or `/unsplash/search`).
- Define Match session and leaderboard contracts, including score validation.

### Definition of done

- The Feature Spec, backlog, and API contracts do not contradict one another.
- Every in-scope feature has a Trello task and acceptance criteria.
- Decisions affecting architecture are recorded in an ADR or the Feature Spec.

---

## 5. Phase 1 — Fix access architecture

**Priority:** P0  
**Blocks:** study modes, catalog, fork, star, progress, Match

### Backend

- Add one centralized `DeckAccessPolicy` (or equivalent application service).
- Cover these actions explicitly:
  - `VIEW`;
  - `STUDY`;
  - `EDIT`;
  - `FORK`;
  - `STAR`;
  - `EXPORT`;
  - `SUBMIT_PROGRESS`;
  - `SUBMIT_MATCH_SCORE`.
- Apply the policy to every Deck, Flashcard, Progress, Star, Fork, and
  Leaderboard use case.
- Prevent access to private card IDs through the star endpoint.
- Prevent private Deck metadata leakage through due-review endpoints.
- Add Platform Admin authorization only if it remains in the approved scope.

### Frontend

- Move public catalog and public/unlisted study routes outside the
  Organization-required layout.
- Allow an authenticated user without an Organization to create and study
  personal decks.
- Keep Organization guards only on LMS-specific pages.
- Add proper `401`, `403`, and `404` states for Vocabulary routes.

### Tests

- Add an access matrix covering guest, owner, authenticated non-owner,
  Organization-less user, and Platform Admin if applicable.
- Add integration tests for private, unlisted, public, draft, published, and
  archived decks.

### Definition of done

- No Vocabulary action relies on Organization membership unless it is an LMS flow.
- Knowing a Deck or Flashcard ID cannot bypass visibility or ownership rules.
- Public catalog and permitted study pages work for guests.

---

## 6. Phase 2 — Data safety and Deck lifecycle

**Priority:** P0

### Seed safety

- Replace the destructive general seed with an idempotent seed that only
  upserts required system/reference data.
- Move demo-data deletion into a separate, explicitly named reset command.
- Require an explicit opt-in flag for destructive demo reset operations.
- Reject destructive reset in production, staging, and preview environments.

### Lifecycle

- Enforce the lifecycle policy inside the domain entity/use cases.
- Permit only approved transitions, for example:
  - `DRAFT → PUBLISHED` with at least two cards;
  - `PUBLISHED → DRAFT` through unpublish;
  - `PUBLISHED → ARCHIVED`;
  - `ARCHIVED → DRAFT` through restore.
- Reject repeated or invalid transitions with stable domain error codes.
- Make card deletion plus any required Deck status change transactional.

### Database integrity

- Add validation or database constraints for:
  - Leitner box range `1..5`;
  - non-negative duration and counters;
  - valid card position values;
  - Match card count.
- Reconcile Prisma schema indexes with committed migrations.

### Definition of done

- Running the normal seed never deletes user or tenant data.
- Invalid lifecycle transitions cannot be persisted through any endpoint.
- Lifecycle and reset behavior have integration tests.

---

## 7. Phase 3 — Atomic Deck Editor and card reorder

**Priority:** P0  
**Related existing work:** Trello F-03 and F-05

### Backend

- Introduce an atomic editor endpoint, for example:

  ```http
  PUT /api/v1/vocab/decks/:deckId/editor
  ```

- Accept validated Deck metadata plus card create/update/delete/reorder changes.
- Execute the entire save inside one database transaction.
- Validate reorder input as an exact permutation of that Deck's card IDs:
  - no foreign IDs;
  - no duplicate IDs;
  - no missing IDs;
  - contiguous resulting positions.
- Resolve concurrent slug and card-position creation safely.

### Frontend

- Persist drag-and-drop order through the atomic editor contract.
- Track explicit deletions so clearing a card does not silently leave stale data.
- Add editing for `tags` and `language` if they remain part of the Deck model.
- Preserve unsaved editor changes in `localStorage` and restore them after reload.
- Add virtualization when the Deck contains more than 50 cards.
- Surface field-level and transaction-level save errors without discarding edits.

### Definition of done

- Create, update, delete, and reorder are committed together or rolled back together.
- Reloading the editor preserves the saved order exactly.
- Interrupted or failed saves cannot partially mutate a Deck.
- F-03 and F-05 acceptance criteria are covered by integration/component tests.

---

## 8. Phase 4 — Harden SRS and due reviews

**Priority:** P1  
**Related Trello cards:** #16 and #19

### SRS engine

- Add the full 10-case test matrix: correct and incorrect answers for boxes 1–5.
- Lock the approved status mapping in domain tests.
- Test interval calculation using a fixed clock.
- Test boundary behavior at box 1 and box 5.

### Progress submission

- Reject or deterministically deduplicate repeated `flashcardId` values.
- Confirm every submitted card belongs to the requested Deck.
- Apply access policy before creating progress.
- Make batch progress updates atomic.
- Prevent lost updates during concurrent submissions.

### Due reviews

- Align the due counter and `onlyDue` study filter semantics.
- Add the due badge to the product-approved global/sidebar location.
- Add usable `onlyDue` and `onlyStarred` entry points to study pages.
- Verify timezone behavior at the `nextReviewAt` boundary.

### Definition of done

- The SRS engine has exhaustive transition coverage.
- A malformed or concurrent batch cannot create inconsistent progress.
- Due counts and the cards opened by the user always agree.
- Only then may Trello #16 and #19 move to `Done`.

---

## 9. Phase 5 — Implement the Match backend and leaderboard

**Priority:** P1  
**New Trello task required:** yes

The frontend Match game currently expects leaderboard endpoints, but no backend
controller/use cases implement them. A backend is required because the
leaderboard is shared and persistent.

### Recommended API

```http
POST /api/v1/vocab/decks/:deckId/match/sessions
POST /api/v1/vocab/decks/:deckId/match/sessions/:sessionId/complete
GET  /api/v1/vocab/decks/:deckId/leaderboard
```

### Backend

- Create a Match session only after checking Deck study access and the six-card minimum.
- Store or sign session metadata so arbitrary client durations are not blindly trusted.
- Validate completion against the session, Deck, user, expiry, and card count.
- Store a leaderboard result transactionally.
- Define whether the board returns best-per-user or every attempt; best-per-user
  is recommended for a useful ranking.
- Add pagination and deterministic tie-breaking.
- Rate-limit session creation and completion.

### Frontend

- Check the six-card minimum before initializing the Match reducer/hook.
- Display submission errors instead of silently ignoring them.
- Render the leaderboard and the user's best result.
- Prevent repeated score submission after completion.
- Include keyboard and accessible interaction states where practical.

### Tests

- Test Decks with fewer than six cards.
- Test forged, expired, duplicated, and cross-Deck sessions.
- Test leaderboard ordering and equal-duration tie-breaking.
- Add an E2E happy path from game start through leaderboard display.

### Definition of done

- Match cannot crash on an undersized Deck.
- A valid completion appears in the leaderboard.
- A client cannot submit an arbitrary score without a valid session.

---

## 10. Phase 6 — Complete Learn as an adaptive mode

**Priority:** P1  
**Related Trello card:** #18
**Implementation status:** Complete; verify Trello status before changing it.

### Work

- Replace the manual mode-only flow with an adaptive session state machine.
- Track mastery per card during the current session.
- Require two consecutive correct answers before mastery: MCQ → typing for the
  same card, then mastery. A wrong answer resets that card to its initial mode.
- Start each eligible card with MCQ and transition it directly to written
  typing; use typing-only for selections without four unique options.
- Generate three unique, valid distractors and handle small Decks safely.
- Implement the approved fuzzy-match rule, including the `Almost correct` state.
- Provide TTS after reveal through the shared speech contract described above.
- Submit progress once per answered card without duplicate mutations.
- Persist or intentionally reset an interrupted session according to the spec.

### Tests

- State-machine transition tests.
- Distractor uniqueness tests.
- Exact, normalized, fuzzy, and incorrect answer tests.
- Component tests for feedback and progression.

### Definition of done

- Learn adapts per card rather than merely offering a manual MCQ/Typing choice.
- The minimum-card rule and all answer states are enforced.
- Learn source follows the approved FSD grouping and contains no type files in
  `ui`.
- Trello #18 moves to `Done` only after its adaptive acceptance criteria and
  shared-speech migration pass.

---

## 11. Phase 7 — Complete Flashcards study mode

**Priority:** P2  
**Related Trello card:** #17

### Work

**Current baseline:** Flashcards already supports flip, `Know` / `Don't Know`,
progress submission, visible star and pronunciation controls, Space, and the
`1` / `2` answer shortcuts. This phase completes the remaining contract.

- Add the specified keyboard shortcuts:
  - left/right navigation;
  - Space to flip;
  - up arrow to star if retained by the UX contract;
  - replay pronunciation shortcut.
- Add shuffle while preserving stable progress submission.
- Keep flip animation within the approved performance target.
- Extend the shared `useSpeech` hook for all study modes:
  - choose `en-US`, then `en-GB`, then any available English voice;
  - handle asynchronously loaded browser voices and unsupported Web Speech API;
  - expose keyed one-time speech so a reveal is spoken once per question;
  - remove `useLearnFeedbackSpeech` and migrate Learn to the shared hook.
- Hide or replace broken card images gracefully.
- Prevent shortcuts while typing in an input or interacting with controls.
- Verify mobile and reduced-motion behavior.

### Definition of done

- All approved shortcuts, shuffle, TTS fallback, images, and progress work.
- Component tests cover navigation, flip, answer, star, shuffle, TTS,
  voice fallback, image fallback, reduced motion, and completion.
- Trello #17 may then move to `Done`.

---

## 12. Phase 8 — Complete catalog, fork, and image search

**Priority:** P2  
**Related existing work:** Trello F-06, F-07, and T-04

### Catalog

- Return creator display name/avatar or remove those fields from the UI contract.
- Add tag filters to URL search parameters, API calls, and UI.
- Keep filtering and pagination shareable through the URL.
- Verify guest access outside the Organization layout.

### Fork

- Render the existing Fork action on Deck detail/catalog surfaces.
- Display a success path leading to the new editable Deck.
- Return and display fork count if it remains an acceptance criterion.
- Recheck access rules for `PUBLIC` and `UNLISTED` sources.

### Image proxy

- Add a five-second upstream request timeout.
- Enable effective throttling with the configured Nest guard/module.
- Add an environment example entry for the Unsplash key.
- Return the documented number of development mock results.
- Normalize external failures to stable API errors.

### Definition of done

- Catalog filtering, guest access, creator information, and pagination match the spec.
- Users can discover and complete the Fork flow from the UI.
- The image proxy is timeout- and rate-limit-protected.

---

## 13. Phase 9 — Complete starred study and Import/Export

**Priority:** P2

### Starred study — Trello #20

- Add a visible `Starred Only` filter/entry point to study pages.
- Keep star state consistent under rapid or concurrent interactions.
- Use an idempotent `PUT /cards/:cardId/star` contract with
  `{ isStarred: boolean }`; retries must preserve the requested state.
- Return an empty starred-study state for an authenticated user with no starred
  cards; reject a guest's personalized filter with `400 Bad Request`.
- Apply Deck access policy before reading or changing the star state.

### Import/Export — Trello #21

- Add a preview-first import dialog for pasted text and `.csv`, `.tsv`, or
  `.txt` files from Quizlet, Anki text export, Quenti, spreadsheets, and
  generic delimited text.
- Parse quoted delimiters, blank lines, Unicode, and line-level validation
  errors; provide separator detection and editable term/definition/example
  column mapping.
- Allow the user to correct or exclude invalid rows before import.
- Import cards atomically and preserve deterministic ordering.
- Add owner-only export downloads for CSV and JSON; TSV is import-only
  compatibility for source applications.
- Escape spreadsheet-formula prefixes in CSV output to prevent formula injection.
- Verify ownership/access before import or export.
- Define safe limits for rows, field sizes, and total payload size.

### Definition of done

- Starred-only study is reachable and consistent across supported modes.
- A valid import is atomic and invalid input has actionable row-level feedback.
- Exported CSV and JSON can be downloaded and re-imported without data loss.
- Trello #20 and #21 satisfy every acceptance criterion before moving to `Done`.

---

## 14. Phase 10 — Integration, E2E, and release verification

**Priority:** P0 for release

### Required automated coverage

- Deck lifecycle and access matrix.
- Atomic editor save, delete, and reorder rollback.
- Public catalog → Deck study.
- Public/unlisted Deck → Fork → edit.
- Flashcards study → progress → due counter.
- Adaptive Learn completion.
- Match completion → leaderboard.
- Star card → starred-only study.
- Import → edit → export → re-import.
- Seed idempotency and destructive-reset guard.

### Quality gates

Run and pass:

```bash
pnpm --filter backend run type-check
pnpm --filter frontend run type-check
pnpm --filter backend run lint
pnpm --filter frontend run lint
pnpm --filter frontend run lint:fsd
pnpm --filter backend test
pnpm --filter frontend test
pnpm --filter backend build
pnpm --filter frontend build
```

Also verify:

- database migrations apply cleanly to an empty database and an upgraded database;
- no unresolved P0/P1 Vocabulary defects remain;
- API documentation reflects the actual endpoints;
- Trello status matches the verified code state;
- a manual smoke test passes for guest, owner, and authenticated non-owner.

### Definition of done

- All required quality gates and critical E2E flows pass in CI.
- The module meets the approved specification or has documented, approved deviations.
- Release rollback and migration notes are available.

---

## 15. Recommended Trello treatment

| Card | Current reported state | Recommended action |
|---|---|---|
| #16 — Leitner SRS Engine | Code Review | Keep in review until the complete 10-case matrix and status contract are verified |
| #17 — Flashcards Mode | To Do | Move to In Progress/Code Review; finish missing acceptance criteria before Done |
| #18 — Learn / Adaptive | Verify current Trello state | Implementation is complete; move to Done only after the shared-speech migration and final verification |
| #19 — Due Reviews & Progress | Code Review | Keep in review until atomic updates, access, sidebar badge, and due semantics are fixed |
| #20 — Star Cards | Backlog | Move to In Progress; targeted-study UI and access hardening remain |
| #21 — Import/Export | Backlog | Implement after editor contract is stable |
| Match backend | Missing | Create a new backend/leaderboard card with security-focused acceptance criteria |
| Access architecture | Missing | Create a P0 remediation card |
| Safe seed and lifecycle | Missing | Create a P0 remediation card |
| Atomic editor/reorder | Existing cards marked Done | Reopen or create linked bug/remediation cards |

---

## 16. Final release checklist

- [ ] Specification and Trello are aligned.
- [ ] Vocabulary routes are decoupled from Organization membership.
- [ ] Central access policy is applied to every use case.
- [ ] Normal seed is idempotent and non-destructive.
- [ ] Deck lifecycle transitions are enforced.
- [ ] Deck editor writes and progress batches are atomic.
- [ ] SRS transition matrix is exhaustively tested.
- [ ] Due and starred filters are visible and semantically consistent.
- [ ] Match backend and protected leaderboard are operational.
- [ ] Learn mode is genuinely adaptive.
- [ ] Flashcards mode meets its shortcut, shuffle, TTS, and image criteria.
- [ ] Catalog, Fork, and Unsplash acceptance criteria pass.
- [ ] CSV/TSV import and CSV/JSON export are complete and safe.
- [ ] Integration and E2E suites cover all critical flows.
- [ ] No unresolved P0 or P1 defects remain.
