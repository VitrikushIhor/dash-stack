# ADR-001: Decoupled Vocabulary & Flashcard Architecture

## Status
Accepted

## Date
2026-08-21

## Context
The platform requires a rich vocabulary and spaced repetition (SRS) feature similar to Quizlet/Anki. 
Two primary architectural models were considered:
1. **LMS-Tightly Coupled**: Decks and words belong directly to an `Organization` or `Course`.
2. **Decoupled User-Centric (Quizlet-style)**: Decks and flashcards are independent entities created by a `User` with visibility controls. Courses and assignments only reference `deckId`.

Key challenges addressed:
- Conflicts when multiple users share/edit the same lexical terms.
- Permitting personal study without requiring an organization or enrolled classroom.
- Allowing teachers to reuse or assign personal/public decks to classes without duplicating data or coupling domain models.

## Decision

1. **User-Centric Ownership**:
   - The Vocabulary module does NOT have `Student` or `Teacher` roles internally; any authenticated `User` can create, own, fork, and study decks.
   - LMS roles (`Student`, `Teacher`, `OrgAdmin`) reside strictly in LMS modules (Organization / Course / Task) which consume decks via read-only references (`CourseDeck`, `Task.deckId`).
   - Platform `Admin` retains moderation rights over public/system decks.

2. **Isolated Flashcards per Deck (1-to-N)**:
   - A `Flashcard` (term, definition, example, audio, etc.) is owned exclusively by a single `Deck`.
   - Modifying a card in Deck A never affects Deck B.
   - Non-owners cannot edit another user's deck; they must **Fork / Clone** the deck to customize cards.

3. **Progress Isolation**:
   - Progress is tracked per `(userId, deckId, flashcardId)`.
   - Learners studying a public or assigned deck retain their own personal progress record tied to that deck.

4. **Three-Tier Visibility**:
   - `PRIVATE`: Visible strictly to the owner.
   - `UNLISTED`: Accessible via direct link or when embedded in a course/assignment, but omitted from global search/catalog.
   - `PUBLIC`: Indexed and searchable by title/tags across the entire platform.

## Alternatives Considered

### Alternative A: Global Lexicon / Shared Dictionary (Many-to-Many `DeckWord`)
- **Pros**: Reusable word database, global pronunciation/definitions.
- **Cons**: Severe concurrency/editing conflicts. If User A updates a typo or definition in a shared word, it impacts User B's deck unexpectedly. Adds complex override schemas.
- **Verdict**: Rejected for MVP.

### Alternative B: Organization-Scoped Decks
- **Pros**: Natural multi-tenancy boundary.
- **Cons**: Users cannot take their vocabulary decks with them when leaving an organization or study independently. Prevents global discovery and public deck sharing.
- **Verdict**: Rejected.

## Consequences
- Clean separation of concerns between Vocabulary/SRS and Classroom/LMS modules.
- Simplifies Prisma schema and permissions (1-to-N relationships instead of complex M-to-N dictionary mappings).
- High scalability: Studying and public search operate independently of organization tenant switching.
