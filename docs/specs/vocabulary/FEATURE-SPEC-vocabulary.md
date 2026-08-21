# Vocabulary & SRS – Feature Specification

> Version: v1.4  
> Last Updated: 2026-08-21  
> Status: Approved  
> Owner: Igor (Product / Engineering)  
> Reviewers: Architecture Team  
> Related Specs: [./decisions/ADR-001-vocabulary-architecture.md](./decisions/ADR-001-vocabulary-architecture.md), [../../FUNCTIONAL-SPEC.md](../../FUNCTIONAL-SPEC.md)

---

## 1. Module Overview

### 1.1. Purpose

The **Vocabulary & SRS** module is a decoupled, user-centric flashcard and spaced repetition system (similar to Quizlet and Anki).  
The module operates independently from Organizations and Courses: any authenticated user can create decks of flashcards, search and attach illustrative images (Unsplash/Pixabay), study them through diverse interactive modes, fork existing sets, star difficult terms, track SRS review queues, and configure visibility (`PRIVATE`, `UNLISTED`, `PUBLIC`).

Classroom and LMS modules (Courses, Tasks/Assignments) interact with this module strictly via **read-only references** to `deckId`.

**Key User Personas:**
- **Learner / Creator (Any User):** Creates personal decks, attaches images, forks shared decks, practices via various study modes, stars difficult cards, and completes daily SRS reviews.
- **Teacher (via LMS modules):** Uses personal or public decks to attach to courses (`CourseDeck`) or assign as homework assignments (`Task`).
- **Platform Admin:** Curates official starter system decks and moderates public catalog content.

### 1.2. Out of Scope

- AI-automated deck generation from uploaded documents/URLs (Phase 2).
- Advanced mathematical SRS models like FSRS-5 or complex SM-2 interval modifiers (MVP utilizes a battle-tested 5-box Leitner system).
- Audio file uploading/hosting on backend (Text-to-Speech is handled client-side via Web Speech API).
- Monetized marketplace for paid creator decks.
- Mobile offline-first synchronization.

---

## 2. Dependencies & Integration Points

### 2.1. Module Dependencies

- **User / Auth Module:** Required for `ownerUserId` and storing individual `VocabProgress`.
- **Image Provider API (External):** Unsplash API / Pixabay API via backend proxy for instant royalty-free image search.

*Note: Vocabulary does NOT depend on `Organization`, `Course`, or `Task` modules.*

### 2.2. Integration Points

- **Course / Track Module:** References decks via `CourseDeck` join records (`courseId`, `deckId`).
- **Task Module:** Allows assignments with type `VOCAB_SET` referencing `deckId`.
- **Analytics & Reporting:** Reads from `VocabProgress` to show aggregated student performance inside classroom dashboards.

---

## 3. Glossary & Domain Objects

### 3.1. Glossary

- **Flashcard / Term:** A single study item containing a term, definition/translation, example sentence, and optional illustrative image.
- **Deck (Study Set):** A collection of flashcards owned by a single user with visibility and status attributes.
- **Card Count:** The total number of flashcards contained within a deck.
- **Fork / Clone:** Creating an independent duplicate of an existing deck with a new owner.
- **Image Suggestion / Search:** Searching royalty-free stock imagery (e.g. Unsplash) directly by term to attach to a flashcard with one click.
- **Study Mode:** Interactive learning interfaces (Flashcards, Learn/Adaptive, Practice Test, Match game).
- **SRS (Spaced Repetition System):** 5-Box Leitner system scheduling review times based on recall accuracy.
- **Due Cards:** Flashcards whose scheduled `nextReviewAt` is in the past or present.
- **Starred Card:** A card flagged by a user as challenging for targeted practice.
- **VocabProgress:** Per-user, per-card performance metrics, current Leitner box, and SRS schedule.
- **Deck Leaderboard:** Leaderboard ranking match-game completions by elapsed time.

### 3.2. Domain Objects

- **Deck:** Top-level container representing a study set.
- **Flashcard:** A study item contained strictly within a single `Deck`.
- **VocabProgress:** User mastery state, star flag, and review schedule for a specific `Flashcard` within a `Deck`.
- **DeckLeaderboard:** Record of high-score completion time for a Match game session on a `Deck`.

---

## 4. Data Model Sketch

### 4.1. Deck

- `id`: `String` (PK, cuid/uuid)
- `ownerUserId`: `String` (FK → User)
- `title`: `String` (Required, 1–100 chars)
- `slug`: `String` (Unique, optional, for vanity URLs)
- `description`: `String` (Optional, plain text / safe markdown)
- `language`: `String` (Default `en`)
- `level`: `Enum` (A1, A2, B1, B2, C1, C2, optional)
- `tags`: `String[]` (For catalog search and categorization)
- `visibility`: `Enum` (`PRIVATE`, `UNLISTED`, `PUBLIC`)
- `status`: `Enum` (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `type`: `Enum` (`USER_GENERATED`, `SYSTEM`)
- `forkedFromDeckId`: `String` (FK → Deck, optional, tracks original author)
- `createdAt`, `updatedAt`: `DateTime`

> **Computed/Aggregated Field in Queries:** `cardCount: Int` (via Prisma `_count { flashcards: true }`)

### 4.2. Flashcard

- `id`: `String` (PK, cuid/uuid)
- `deckId`: `String` (FK → Deck, `onDelete: Cascade`)
- `term`: `String` (Required, max 255 chars)
- `definition`: `String` (Required, max 1000 chars)
- `example`: `String` (Optional example sentence, max 500 chars)
- `imageUrl`: `String` (Optional image link from Unsplash or custom upload)
- `position`: `Int` (Ordering index within the deck)
- `createdAt`, `updatedAt`: `DateTime`

### 4.3. VocabProgress

- `id`: `String` (PK)
- `userId`: `String` (FK → User)
- `deckId`: `String` (FK → Deck, `onDelete: Cascade`)
- `flashcardId`: `String` (FK → Flashcard, `onDelete: Cascade`)
- `status`: `Enum` (`NEW`, `LEARNING`, `KNOWN`, `MASTERED`, `FORGOTTEN`)
- `box`: `Int` (Leitner box 1–5, default `1`)
- `isStarred`: `Boolean` (Default `false`, user-specific favorite flag)
- `correctStreak`: `Int` (Default `0`)
- `correctCount`: `Int` (Default `0`)
- `incorrectCount`: `Int` (Default `0`)
- `lastReviewedAt`: `DateTime` (Optional)
- `nextReviewAt`: `DateTime` (Optional, scheduled SRS due timestamp)

> **Unique Constraint:** `@@unique([userId, deckId, flashcardId])`  
> **Indexes:** `@@index([userId, nextReviewAt])`, `@@index([deckId])`

### 4.4. DeckLeaderboard

- `id`: `String` (PK, cuid/uuid)
- `deckId`: `String` (FK → Deck, `onDelete: Cascade`)
- `userId`: `String` (FK → User, `onDelete: Cascade`)
- `durationMs`: `Int` (Time taken in milliseconds)
- `cardCount`: `Int` (Number of matched pairs in the game session)
- `createdAt`: `DateTime` (Default `now()`)

> **Indexes:** `@@index([deckId, durationMs])`

---

## 5. State Machine & SRS Algorithm

### 5.1. Deck Lifecycle

```
[DRAFT] --(publish: min 2 cards)--> [PUBLISHED] --(archive)--> [ARCHIVED]
   ^                                     |                         |
   +------------(unpublish)--------------+                         |
   |                                                               |
   +-----------------------(restore)-------------------------------+
```

- **Rules:**
  - `DRAFT → PUBLISHED`: Requires a minimum of 2 flashcards.
  - `DELETE Deck`: Permanently cascades and deletes all child `Flashcard` records, associated `VocabProgress`, and `DeckLeaderboard` entries.

### 5.2. Leitner Box SRS Algorithm

The SRS uses a 5-box Leitner scheduling system with fixed interval multipliers:

| Box | Label | Next Review Interval | Target Mastery |
|---|---|---|---|
| **Box 1** | New / Learning | **+1 day** (24 hours) | Initial exposure |
| **Box 2** | Review 1 | **+3 days** (72 hours) | Short-term recall |
| **Box 3** | Review 2 | **+7 days** (168 hours) | Medium-term retention |
| **Box 4** | Review 3 | **+14 days** (336 hours) | Long-term memory |
| **Box 5** | Mastered | **+30 days** (720 hours) | Permanent retention |

#### Review Logic & State Transitions:

```
[Correct Answer]   -> Box = min(5, Box + 1)
                      nextReviewAt = now() + Interval(Box)
                      correctStreak += 1
                      Status: Box 5 -> MASTERED; Box 3..4 -> KNOWN; Box 1..2 -> LEARNING

[Incorrect Answer] -> Box = 1 (reset to Box 1)
                      nextReviewAt = now() + 1 day
                      correctStreak = 0
                      Status: FORGOTTEN / LEARNING
```

---

## 6. Functional Requirements (User Stories & Acceptance Criteria)

### FR-VOCAB-001 – Create & Manage Deck

**Priority:** Must  
**Role(s):** Authenticated User  

**Goal:** Create decks, configure visibility, and update metadata.

**User Stories:**
- As a creator, I want to create and name a flashcard deck so that I can structure vocabulary learning.

**Inputs:**
- Title (1–100 chars, required), Description (optional), Level (optional), Tags (optional string array).
- Visibility: `PRIVATE` (default), `UNLISTED`, or `PUBLIC`.

**Rules:**
- Decks initialize in `DRAFT` status.
- Only the deck owner or platform Admin can edit deck metadata or delete the deck.

**Acceptance Criteria:**
- **AC-1 (Success):** Given I am logged in, when I submit a valid title and visibility, then a new Deck is created in `DRAFT` state with `ownerUserId` set to my ID.
- **AC-2 (Validation Failure):** Given I submit an empty title or a title > 100 characters, then the API returns `400 Bad Request` and no record is created.
- **AC-3 (Publish Constraint):** Given a deck with 0 or 1 flashcards, when I attempt to set status to `PUBLISHED`, then the request fails with `400 Bad Request (minimum 2 cards required)`.
- **AC-4 (Unauthorized Edit):** Given Deck A owned by User 1, when User 2 attempts `PATCH /api/v1/vocab/decks/A`, then the API returns `403 Forbidden`.

---

### FR-VOCAB-002 – Manage Flashcards (CRUD & Reordering)

**Priority:** Must  
**Role(s):** Deck Owner, Admin  

**Goal:** Add, edit, delete, and reorder flashcards within a deck.

**Inputs:**
- Term (required, 1-255 chars), Definition (required, 1-1000 chars), Example (optional), Image URL (optional).

**Rules:**
- Flashcards belong strictly to one deck.
- Modifying a card updates it immediately for anyone currently studying that deck.
- Non-owners cannot edit cards; they must fork the deck to make changes.

**Acceptance Criteria:**
- **AC-1 (Add Card):** Given I own the deck, when I submit a valid term and definition, then the flashcard is created and appended to the end of the deck (`position = currentMax + 1`).
- **AC-2 (Bulk Reorder):** Given a deck with cards `[C1, C2, C3]`, when I send `PUT /cards/order` with `[C3, C1, C2]`, then card positions are updated accordingly.
- **AC-3 (Non-owner Access):** Given User 2 requesting to delete a card in User 1's deck, then the API returns `403 Forbidden`.

---

### FR-VOCAB-003 – Search & Browse Public Catalog

**Priority:** Must  
**Role(s):** All Users (including Guests)  

**Goal:** Search and discover published public decks across the platform.

**User Stories:**
- As a learner, I want to search for existing public decks by keyword, CEFR level, or topic tags so that I can start studying immediately without building my own cards.

**Inputs:**
- Search query (title/description/tags), CEFR level filter (`A1`–`C2`), tags filter, pagination (`page`, `limit`).

**Rules:**
- Only returns decks where `visibility = PUBLIC` AND `status = PUBLISHED`.
- Response includes `cardCount` and owner display information for each deck.

**Acceptance Criteria:**
- **AC-1 (Public Discovery):** Given a deck with `visibility = PUBLIC` and `status = PUBLISHED`, when any user searches for its title or tag, then it appears in the result list with accurate `cardCount`.
- **AC-2 (Private/Unlisted Excluded):** Given a deck with `visibility = PRIVATE` or `UNLISTED`, when another user searches, then it NEVER appears in the search results.
- **AC-3 (Draft Excluded):** Given a deck with `visibility = PUBLIC` but `status = DRAFT`, then it does NOT appear in search results.

---

### FR-VOCAB-004 – Star Cards & Targeted Study

**Priority:** Must  
**Role(s):** Authenticated User  

**Goal:** Allow learners to star/unstar individual cards during study sessions to focus on difficult terms.

**User Stories:**
- As a student, I want to star difficult words during a session so that I can restart practice with only the starred cards.

**Processing:**
- Toggling star updates `isStarred` boolean in the user's `VocabProgress` record.
- Every study mode supports an optional filter: `onlyStarred=true`.

**Acceptance Criteria:**
- **AC-1 (Toggle Star):** Given I am studying a deck, when I click the star button on Card 1, then a `VocabProgress` record is upserted with `isStarred = true`.
- **AC-2 (Filter Starred):** Given a deck with 10 cards where I starred 3, when I request `/study?onlyStarred=true`, then exactly those 3 cards are returned for the session.
- **AC-3 (Empty Starred Guard):** Given a deck with 0 starred cards, when requesting `/study?onlyStarred=true`, then the client receives `400 Bad Request` or an empty study state prompting the user to star words first.

---

### FR-VOCAB-005 – Audio Pronunciation (Web Speech API)

**Priority:** Must  
**Role(s):** All Users (including Guests)  

**Goal:** Provide zero-latency native audio pronunciation for English terms and example sentences.

**Technical Execution:**
- Pronunciation runs entirely client-side using the browser's standard `window.speechSynthesis` (Web Speech API).
- Default voice: `en-US` (with fallback to `en-GB` or any available English voice).
- Includes keyboard shortcut (e.g. `Ctrl+J` / `Cmd+J` or `Audio Icon Click`) to replay term audio.

**Acceptance Criteria:**
- **AC-1 (Pronounce Term):** Given a flashcard displayed on screen, when the user clicks the audio icon or presses `Ctrl+J`, then `window.speechSynthesis.speak()` is triggered with the term string and `lang="en-US"`.
- **AC-2 (Browser Fallback):** Given a browser where `en-US` voice is unavailable, then the synthesizer automatically falls back to default system English without throwing runtime errors.

---

### FR-VOCAB-006 – Flashcard Image Search & Attachment

**Priority:** Must  
**Role(s):** Deck Owner  

**Goal:** Enable instant discovery and attachment of relevant images to flashcards (like Quizlet/Quenti) to enhance visual memory retention.

**User Stories:**
- As a creator, I want to search for an image by term name with one click and attach it to my card so that learners benefit from visual association.

**Processing & Features:**
1. **Auto-Query:** In the flashcard editor, clicking the image icon automatically searches Unsplash API using the current card's `term`.
2. **Inline Gallery:** Displays a grid of 6–12 royalty-free thumbnail suggestions with pagination.
3. **One-Click Select:** Clicking an image saves its secure web-optimized URL to `imageUrl`.
4. **Remove / Replace:** Creators can remove or replace the attached image anytime.
5. **Study Mode Rendering:** Flashcards display the image on the card face alongside the definition or term.

**Acceptance Criteria:**
- **AC-1 (Search Suggestions):** Given I am editing a card with term "Butterfly", when I click the "Search Image" button, then `GET /api/v1/vocab/images/search?q=Butterfly` returns 12 image results with thumbnail and preview URLs.
- **AC-2 (Attach Image):** Given search results, when I click image thumbnail #2, then `imageUrl` is populated and saved on the flashcard.
- **AC-3 (Study Mode Display):** Given a card with an attached `imageUrl`, when viewed in Flashcards or Learn mode, then the image renders cleanly with aspect-ratio preservation and lazy loading.

---

### FR-VOCAB-007 – Study Modes & Minimum Card Constraints

**Priority:** Must  
**Role(s):** Authenticated User, Guest (read-only mode without saving progress)  

**Study Modes:**

1. **Flashcards Mode (Must):**
   - Front/Back card flip animation, shuffle, keyboard navigation (Space to flip, Left/Right arrows for Next/Prev, Up arrow to Star).
   - "Know" vs "Still Learning" buttons updating SRS session state.
   - Minimum cards: **1 card**.

2. **Learn / Adaptive Mode (Must):**
   - Adaptive mixed testing: Multiple Choice prompt → Written Typing prompt upon consecutive successes.
   - Distractors for Multiple Choice are randomly selected from other cards in the same deck.
   - Minimum cards constraint: **4 cards** (required to form 1 correct + 3 distractor choices). If deck has < 4 cards, falls back to typing prompts only.

3. **Practice Test Mode (Should):**
   - Auto-generated graded test combining True/False, Multiple Choice, and Written inputs.
   - Produces a final summary score (e.g. 85%) and detailed answer breakdown.
   - Minimum cards: **4 cards**.

4. **Match Game (Could):**
   - Interactive timed tile-matching grid (term ↔ definition).
   - Session selects **6 to 12 pairs** per round. Timer tracks seconds with penalty for wrong matches.
   - Submits final completion time to the Deck Leaderboard.
   - Minimum cards: **6 cards**.

**Acceptance Criteria:**
- **AC-1 (Flashcard Flip):** Given a deck with 1 card, when starting Flashcards mode and pressing `Space`, then the card flips from Term to Definition.
- **AC-2 (Learn Mode Distractors):** Given a deck with >= 4 cards, when an MCQ question is presented, then 1 option is the correct definition and 3 options are distinct random definitions from other cards in the same deck.
- **AC-3 (Match Mode Min Cards Guard):** Given a deck with 3 cards, when requesting Match mode, then the API / UI returns `400 Bad Request (minimum 6 cards required for Match game)`.
- **AC-4 (Match Leaderboard Submission):** Given a completed Match game round of 8 cards in 14.5 seconds, when submitting score, then a `DeckLeaderboard` entry with `durationMs = 14500` is saved and top ranks are returned.

---

### FR-VOCAB-008 – Fork / Clone Deck

**Priority:** Should  
**Role(s):** Authenticated User  

**Goal:** Clone a public or unlisted deck into the user's personal collection.

**Processing:**
- Deep copies the Deck and all child Flashcards with the user as the new `ownerUserId`.
- Sets `forkedFromDeckId` to preserve attribution.

**Acceptance Criteria:**
- **AC-1 (Fork Success):** Given User 2 viewing a public Deck 1 owned by User 1 with 15 cards, when User 2 clicks "Fork", then a new Deck is created with `ownerUserId = User 2`, `forkedFromDeckId = Deck 1`, and 15 duplicated Flashcards.
- **AC-2 (Isolation):** Given User 2 forked Deck 1, when User 2 edits a term in their copy, then Deck 1 remains completely unchanged.
- **AC-3 (Private Guard):** Given User 2 trying to fork a `PRIVATE` deck owned by User 1, then the API returns `404 Not Found` / `403 Forbidden`.

---

### FR-VOCAB-009 – SRS Due Reviews & Daily Counter

**Priority:** Must  
**Role(s):** Authenticated User  

**Goal:** Provide the learner and student dashboards with exact counts of cards scheduled for review today.

**User Stories:**
- As a student, I want to see how many words are due for review on my home dashboard so that I maintain daily learning consistency.

**Processing:**
- Computes count of `VocabProgress` records where `userId = currentUserId` AND `nextReviewAt <= now()`.
- Supports fetching global due count across all decks or per-deck due count.

**Acceptance Criteria:**
- **AC-1 (Due Calculation):** Given 5 cards with `nextReviewAt` in the past and 3 cards with `nextReviewAt` tomorrow, when calling `GET /api/v1/vocab/reviews/due`, then `dueCount` returns `5`.
- **AC-2 (Leitner Update on Correct):** Given a card in Box 2, when marked correct in review, then `box` becomes `3`, `nextReviewAt` is set to `now() + 7 days`, and `correctStreak` increments by 1.
- **AC-3 (Leitner Reset on Miss):** Given a card in Box 4, when marked incorrect in review, then `box` resets to `1`, `nextReviewAt` is set to `now() + 1 day`, and `status` changes to `FORGOTTEN`.

---

### FR-VOCAB-010 – Import & Export Flashcards

**Priority:** Should  
**Role(s):** Deck Owner  

**Features:**
- **Import:** Fast bulk paste dialog supporting Tab/Comma-separated text (Quizlet format).
- **Export:** Instant download of deck content as CSV, TSV, or JSON.

**Acceptance Criteria:**
- **AC-1 (TSV Import):** Given 10 lines of `term\tdefinition` pasted in the import box, when submitted, then 10 new `Flashcard` records are created in the deck with matching positions.
- **AC-2 (Malformed Input Handling):** Given empty lines or lines without a separator, then the parser ignores empty rows and highlights rows lacking a definition with validation messages.
- **AC-3 (Export):** Given a deck with 20 cards, when clicking "Export CSV", then a properly escaped `.csv` file download begins immediately.

---

## 7. API Contract (High-Level)

### 7.1. Endpoints

```http
# Decks
POST   /api/v1/vocab/decks                      # Create deck
GET    /api/v1/vocab/decks                      # List my decks (returns cardCount)
GET    /api/v1/vocab/decks/public               # Search public catalog (query, tags, level; returns cardCount)
GET    /api/v1/vocab/decks/:id                  # Get deck details & cards
PATCH  /api/v1/vocab/decks/:id                  # Update deck metadata (Owner/Admin)
DELETE /api/v1/vocab/decks/:id                  # Cascade delete deck (Owner/Admin)
POST   /api/v1/vocab/decks/:id/fork             # Fork deck to personal library

# Flashcards & Images
POST   /api/v1/vocab/decks/:id/cards            # Add card(s) (bulk supported)
PATCH  /api/v1/vocab/decks/:id/cards/:cardId    # Update card (Owner only)
DELETE /api/v1/vocab/decks/:id/cards/:cardId    # Delete card (Owner only)
PUT    /api/v1/vocab/decks/:id/cards/order      # Reorder cards (array of card IDs)
GET    /api/v1/vocab/images/search?q=:term      # Search Unsplash images for term

# Study, SRS & Progress
GET    /api/v1/vocab/reviews/due                # Get all due cards across decks (or counts per deck)
GET    /api/v1/vocab/decks/:id/study            # Get cards for study session (params: mode, onlyStarred, onlyDue)
POST   /api/v1/vocab/decks/:id/progress         # Submit study results (updates box, streak, nextReviewAt)
POST   /api/v1/vocab/cards/:cardId/star         # Toggle star on a card
GET    /api/v1/vocab/decks/:id/leaderboard      # Get top Match game scores
POST   /api/v1/vocab/decks/:id/leaderboard      # Submit Match score (duration in ms)
```

---

## 8. Error Handling & UX Considerations

### 8.1. Error States

- **400 Bad Request:** Insufficient cards for requested study mode (e.g. attempting Match mode with 3 cards).
- **403 Forbidden:** Attempting to edit or delete a deck owned by another user.
- **404 Not Found:** Deck does not exist or is marked `PRIVATE` while requested by a non-owner.
- **409 Conflict:** Duplicate slug or import format parsing error.
- **502 Bad Gateway:** External Image Search provider rate limit / downtime (client gracefully falls back to text-only mode).

### 8.2. UX Flow Notes

- **Confirmation Dialog:** Permanent deletion of a deck requires explicit confirmation modal informing the user that all cards and study stats will be deleted.
- **Image Loading:** Card images utilize progressive blurred placeholders or skeleton loaders while loading high-res thumbnails.
- **Audio Feedback:** Optional subtle sound effects on correct/incorrect answers during Match and Learn modes.
- **Form State Preservation:** Flashcard creation drawer preserves unsaved drafts in browser `localStorage` if interrupted.

---

## 9. Permissions & Visibility Matrix

| Capability | PRIVATE Deck | UNLISTED Deck | PUBLIC Deck |
|---|---|---|---|
| Visible in Global Search | Owner only | ❌ No | ✅ Yes |
| Access via Direct Link | Owner only | ✅ Anyone with link | ✅ Yes |
| Attach to Course / Task | Owner only | ✅ Owner / Link holder | ✅ Yes |
| Study & Save Progress | Owner only | ✅ Any logged-in user | ✅ Any logged-in user |
| Toggle Starred Cards | Owner only | ✅ Any studying user | ✅ Any studying user |
| Search & Attach Images | Owner only | Owner only | Owner only |
| Edit Cards / Metadata | Owner only | Owner only | Owner only |
| Fork Deck | Owner only | ✅ Anyone with access | ✅ Anyone |
| Permanent Delete | Owner / Admin | Owner / Admin | Owner / Admin |

---

## 10. Non-Functional Requirements

- **Performance:** Study session API (`/study`) response time < 50ms; client cache ensures instant card flipping with zero lag.
- **Audio Latency:** Web Speech API provides immediate (<20ms) pronunciation trigger without network roundtrips.
- **Image Optimization:** External image URLs request thumbnail sizes (`w=400&q=80`) to minimize mobile data consumption.
- **Scalability:** Decks support up to 500 cards per set smoothly with virtualized scrolling in editor.
- **Cascade Reliability:** Database foreign keys enforce `ON DELETE CASCADE` across `Flashcard`, `VocabProgress`, and Leaderboard records.

---

## 11. Migration & Data Seeding

### 11.1. Migrations

- Create `Deck`, `Flashcard`, `VocabProgress`, and `DeckLeaderboard` tables in Prisma schema.
- Add composite unique indexes on `VocabProgress (userId, deckId, flashcardId)`.
- Add index on `DeckLeaderboard (deckId, durationMs)`.

### 11.2. Starter System Decks (Seed Data)

System seed script (`prisma/seed.ts`) will initialize default public decks (`type: SYSTEM`, `visibility: PUBLIC`, `status: PUBLISHED`):
1. **Top 100 Irregular Verbs** (A1–B1) – 100 cards with Base, Past Simple, Past Participle forms.
2. **Oxford 3000 Starter (A1)** – Core essential English vocabulary.
3. **Oxford 3000 Elementary (A2)** – Everyday conversational vocabulary.
4. **Essential IT & Software Terms** (B1–B2) – Technical English vocabulary for developers.

---

## 12. Risks & Assumptions

### 12.1. Assumptions

- Browser Web Speech API is supported across 98%+ of target browsers (Chrome, Safari, Firefox, Edge).
- Unsplash / Pixabay API keys configured via backend environment variables (`UNSPLASH_ACCESS_KEY`).

### 12.2. Risks & Mitigations

- **XSS & Content Injection:** User inputs in Term, Definition, and Example are strictly sanitized and rendered as plain text (or strictly whitelisted markdown without raw HTML).
- **Broken / Removed External Images:** Flashcard UI gracefully handles `onError` events on image tags by hiding the broken image container without breaking the card layout.
- **Deleted Decks linked to LMS Tasks:** If a deck is deleted while linked to an LMS `Task`, the Task UI gracefully displays a *"Deck was removed by author"* banner rather than throwing a 500 crash.

---

## 13. Open Questions & Future Extensions

### 13.1. Open Questions

- Should users be able to set daily SRS review reminders via email/browser push? (Deferred to Notification Module).

### 13.2. Future Extensions (Phase 2)

- **AI Deck Generator:** Input a topic or paste an article to automatically generate 20 flashcards with definitions, images, and example sentences.
- **FSRS-5 Algorithm:** Option for advanced learners to switch from Leitner to FSRS (Free Spaced Repetition Scheduler).
- **Audio Recording:** Allow students to record their own voice to compare pronunciation against native Web Speech audio.

---