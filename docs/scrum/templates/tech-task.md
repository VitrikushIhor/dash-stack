# Template: Technical Task (`[TECH]`)

Used for technical engineering tasks: database schemas and migrations, query optimization, caching (Redis), background workers (BullMQ/Jobs), CI/CD pipelines, security hardening, and architectural refactoring.

---

## 🏷️ Card Configuration
- **Title Prefix:** `[TECH]`
- **Labels:** `⚙️ Tech Task` + (`🛠️ Backend` / `🎨 Frontend` / `🧪 QA / Tests`)
- **Story Points:** Specified at the end of the title, e.g., `(2SP)`

---

## 📄 Universal Template (Copy & Paste)

```markdown
### ⚙️ Technical Goal & Context
A clear description of the technical necessity (what is being refactored, optimized, migrated in the DB, or configured in the infrastructure).

---

### 📌 Prerequisites
- [ ] [Specify dependency on package upgrade, another task, or "None"]

---

### 📋 Acceptance Criteria
- [ ] Criteria 1 (concrete technical outcome: migration generated, query time reduced, etc.)
- [ ] Criteria 2 (zero regressions in dependent modules/services)
- [ ] Criteria 3 (test coverage added and CI checks pass)

---

### 🛠️ Implementation Plan
- [ ] Step 1 (schema / configuration changes)
- [ ] Step 2 (logic implementation / data migration)
- [ ] Step 3 (benchmarks, tests, backwards compatibility check)

---

### 📚 Tech Details & References
- **Target Files:** `prisma/schema.prisma`, `src/server/...`
- **Dependencies / Tools:** Prisma, Redis, Docker, GitHub Actions
- **Spec / ADR:** `docs/specs/...`
```

---

## 💡 Example 1: Database & Migrations

**Card Title:** `[TECH] Add Prisma Models for VocabularyDeck, Card, and SRS Sessions with Indexes (2SP)`  
**Labels:** `⚙️ Tech Task`, `🛠️ Backend`

```markdown
### ⚙️ Technical Goal & Context
Define the relational database structure (Prisma schema) for the vocabulary module supporting decks, tags, flashcards, and spaced repetition review history (SRS) with optimized composite indexes for high-throughput queries.

---

### 📌 Prerequisites
- [x] Entity specifications finalized in `docs/specs/vocabulary/FEATURE-SPEC-vocabulary.md`

---

### 📋 Acceptance Criteria
- [ ] Models created: `VocabularyDeck`, `VocabularyCard`, `StudySession`, `CardReviewHistory`.
- [ ] Composite indexes configured:
  - `@@index([organizationId, isPublic])` on `VocabularyDeck`
  - `@@index([deckId, nextReviewDate])` on `VocabularyCard`
  - `@@index([userId, createdAt])` on `StudySession`
- [ ] Cascade deletion configured (`onDelete: Cascade`) for cards upon deck removal.
- [ ] Prisma migration applies cleanly without blocking production locks.
- [ ] Prisma Client updated and strict TypeScript types exported.

---

### 🛠️ Implementation Plan
- [ ] Add model definitions to `prisma/schema.prisma`
- [ ] Execute `npx prisma migrate dev --name init_vocabulary_and_srs_models`
- [ ] Create seed script (`prisma/seed/vocabulary.ts`) with mock data
- [ ] Verify types in data access layer `src/server/db`
```

---

## 💡 Example 2: Backend Performance & Caching

**Card Title:** `[TECH] Eliminate N+1 Queries and Add Redis Caching for Public Deck List (3SP)`  
**Labels:** `⚙️ Tech Task`, `🛠️ Backend`

```markdown
### ⚙️ Technical Goal & Context
Optimize public deck retrieval on the vocabulary explore page. Currently, each deck triggers separate queries for card counts and author profiles (N+1 queries), causing significant load on PostgreSQL.

---

### 📋 Acceptance Criteria
- [ ] Deck query executed via a single SQL query using `_count` and `include: { author: true }`.
- [ ] Response cached in Redis with a 5-minute TTL (`key: public_decks:page:X:filter:Y`).
- [ ] Cache invalidation implemented on deck creation, edit, or deletion.
- [ ] Server response time reduced from 450ms to < 30ms for cached responses.

---

### 🛠️ Implementation Plan
- [ ] Rewrite Prisma query in `PublicDecksRepository.findMany()`
- [ ] Implement `redisClient.getOrSet()` caching wrapper
- [ ] Add `redisClient.del()` invalidation trigger in `DeckService.updateDeck()`
- [ ] Write integration test verifying cache hit/miss and invalidation cycles
```
