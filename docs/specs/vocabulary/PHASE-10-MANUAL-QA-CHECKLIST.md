# Vocabulary & SRS — Phase 10 Manual QA Checklist

> **Purpose:** final human verification after automated checks.  
> **Scope:** `/vocab/*` and `/vocab/catalog`; no Practice Test scope.  
> **Do not use:** a production database, a personal deck, or the existing large QA deck.  
> **Result vocabulary:** Pass / Fail (attach exact route, steps, screenshot, console/network error).

## Preconditions

- Use a disposable owner account and a unique run prefix, for example
  `Phase10-manual-YYYYMMDD-HHmm`.
- Keep the existing seeded and user decks unchanged.
- Create disposable public, unlisted, private, draft, and archived decks where
  a case needs one; remove only records created with the run prefix after QA.
- Open DevTools Network and Console. Record unexpected `4xx`/`5xx`, console
  errors, duplicate mutating requests, and focus/scroll regressions.

## User-run case: 4 MiB frontend transport boundary

This is intentionally assigned to the reviewer because it needs an observed
browser upload and a decision about the exact boundary environment.

| ID | Setup and steps | Expected result |
|---|---|---|
| I-4M-01 | On a disposable owned deck, prepare valid UTF-8 CSV whose raw input is just below the configured 4 MiB limit. Choose it through **Import cards → Browse files**, preview, then confirm. | Preview is usable, one request reaches the backend, import is atomic, count/order/content survive reload. |
| I-4M-02 | Prepare valid UTF-8 CSV one byte over the same raw-input limit. Select it through the same file control. | Client rejects it before confirmation with a clear size error; no import request and no deck mutation. |
| I-4M-03 | Prepare payload whose raw file is within 4 MiB but whose complete JSON request envelope exceeds the server allowance. Confirm import. | Backend returns a clear non-success response; no partial records are written. Record actual HTTP status and message. |
| I-4M-04 | Repeat I-4M-01 using pasted text rather than a file. | Equivalent size protection and atomic behavior; browser remains responsive. |

Record: raw byte count, final transport byte count if visible, browser/backend versions,
HTTP status, elapsed time, deck count before/after, and cleanup result.

## Agent browser manual QA plan and evidence

The agent runs the cases below on currently available local services using a
dedicated browser tab. Write outcomes into the Phase 10 release report only
after the whole run is complete and the user approves a documentation commit.

### A. Guest catalog and public study

- Catalog loads, search/CEFR filters have visible state, and public decks appear.
- Guest opens a public deck; Flashcards navigation, flip, shuffle, answer and
  guest save-progress CTA behave read-only.
- Guest `Due only` and `Starred only` filters are rejected instead of silently
  selecting personal data.
- Direct unlisted URL opens but does not appear in catalog.

**2026-09-20 agent-run result:** Pass for catalog → public deck → guest
Flashcards/Learn and the guest personalized-filter denial. `onlyDue=true`
returned the visible authentication error and reset action rather than exposing
personal data. Unlisted direct-link/catalog exclusion remains user-run.

### B. Owner deck lifecycle and editor

- Owner without Organization membership can create, edit, save, reorder and
  delete cards on a disposable private deck.
- Failed/invalid editor save leaves the persisted deck unchanged.
- Private/draft/archived decks are visible to their owner only; a different
  authenticated user and guest receive denial/not-found behavior.
- Public and unlisted published decks can be forked; fork is private/draft,
  gets new card IDs, can be edited independently, and source remains unchanged.

**2026-09-20 agent-run result:** Pass for public → fork → private draft →
rename/save. The disposable fork is
`Phase10 Manual QA 2026-09-20` (`cmu9fm2mb0001af8zalwm0s1k`). Reorder/delete,
rollback on an invalid save, unlisted flow, and second-user denial remain
user-run because this browser session has only one authorized test identity.

### C. Flashcards and SRS

- Previous/next, flip, answer, shuffle, image fallback and star controls work.
- Correct/incorrect answers persist progress; due count changes only through
  review, never through star toggling.
- `onlyDue`, `onlyStarred`, their intersection, reset-to-All, and URL changes
  persist when switching Flashcards/Learn/Match. Empty authenticated selection
  has an empty state and never starts a session.
- Completion summary survives its refetch.

**2026-09-20 agent-run result:** Pass for owner star, `onlyStarred` URL state,
filter propagation to Learn/Match, and reset to All. The starred selection
showed one card without starting an empty session. Review-derived due changes,
image fallback, shuffle, and a refetch after a Flashcards completion remain
user-run.

### D. Adaptive Learn

- A deck with enough distinct cards starts MCQ; correct answer advances to the
  typing/mastery stage, incorrect answer shows feedback and remains retryable.
- Decks with too few distinct distractors use typing fallback without crashing.
- Reload/interruption resumes the same session; retrying an already-submitted
  attempt does not add duplicate progress.
- Keyboard focus and Enter/Space controls remain usable; unsupported TTS shows
  a graceful fallback. Actual sound is verified separately by the user.

**2026-09-20 agent-run result:** Pass for an authenticated typing answer and
reload-resume: the persisted session retained its answer, streak and Continue
state after reload. MCQ fallback, an incorrect retry, duplicate submission, and
keyboard/unsupported-TTS paths remain user-run. Actual TTS is user-verified.

### E. Match and leaderboard

- Fewer than six selected cards shows the minimum-card guard before a session.
- With six or more, match starts only for an authenticated user; recording all
  pairs completes once and shows server-derived result/leaderboard.
- Reload/back does not double-complete; expired session has a clear recoverable
  state. Best result per user remains authoritative.

**2026-09-20 agent-run result:** Pass for the fewer-than-six guard and a
12-pair authenticated completion. The UI showed a server-recorded 49.2-second
completion and the owner's best result in the leaderboard. Expiry and
reload/back double-completion remain user-run.

### F. Import/export and large deck

- Test CSV, TSV, TXT and JSON v1 through paste and file selection; verify
  mapping, separator/header options, edit/exclude, cancel-without-writes,
  quoted fields/newlines/Unicode, and warnings for HTML/cloze/media.
- Export CSV and JSON; inspect actual files. JSON v1 round-trip preserves term,
  definition, example, image URL and order. CSV formula protection is retained.
- For a disposable 1000-card deck, import, reload, deep-scroll to card 140+,
  star/unstar, reload and confirm scroll/list state does not jump to the top.
- Verify owner-only import/export, double-submit/retry behavior, 2000-card
  acceptance and 2001-card rejection. Use I-4M-01 through I-4M-04 for size.

**2026-09-20 agent-run result:** Pass for JSON export initiation and a
two-row pasted TSV import. The editable preview preserved Unicode, displayed
the unmapped-column warning, required acknowledgement, and increased the
deck from 20 to 22 cards after confirmation. File selection, other source
presets, actual download-content inspection, retry/double-submit, and large
deck boundaries remain user-run.

### G. Accessibility, navigation and responsive checks

- Tab through dialogs, controls, cards and close buttons; focus is visible and
  dialog close/back/forward does not lose unexpected state.
- Test a mobile viewport and reduced-motion preference: no clipped critical
  actions, accessible dialog controls, no blocked navigation.
- Physical touch and actual TTS audio require a real device/browser check;
  do not count desktop click or emulation as evidence for either.

**2026-09-20 agent-run result:** Desktop browser route transitions and modal
URL state were exercised. Mobile/reduced-motion, physical touch, and actual
TTS are outside this desktop browser run; actual TTS/physical touch are
user-verified.

## Final sign-off

- [ ] I-4M-01 through I-4M-04 completed by user.
- [x] Agent/manual browser cases A–G recorded with Pass/Fail evidence and
  explicit user-run remainder.
- [ ] Disposable records listed and cleaned; the agent-created fork above is
  intentionally left for review pending explicit deletion approval. Existing
  QA and seeded decks were not modified.
- [ ] Remote CI run is green after push.
- [ ] Release report refreshed with the final committed SHA and CI URL.
