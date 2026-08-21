# Template: Feature / User Story (`[FEAT]`)

Used for new user-facing capabilities, business modules, REST/tRPC API endpoints, and Full-Stack functionality.

---

## 🏷️ Card Configuration
- **Title Prefix:** `[FEAT]`
- **Labels:** `✨ Feature` + (`🛠️ Backend` / `🎨 Frontend` / `Fullstack`) + `🔥 High Priority` (if critical)
- **Story Points:** Specified at the end of the title, e.g., `(3SP)`

---

## 📄 Universal Template (Copy & Paste)

```markdown
### 🎯 User Story / Goal
As a **[user role / API consumer]**,  
I want **[action / endpoint / feature]**,  
so that **[benefit / business value / outcome]**.

---

### 📌 Prerequisites
- [ ] [Specify dependency on DB schema, another PR, or "None"]

---

### ⚙️ Requirements & API Contracts
- **Method & Path:** `POST /api/v1/...` (if API/Backend)
- **Payload / Input:** `{ field: string, count: number }`
- **Response Format:** `{ success: boolean, data: ... }`
- Behavior and validation rules (`400`, `401`, `403`, `404`, `500` error handling)

---

### 📋 Acceptance Criteria
- [ ] Unauthenticated requests return `401 Unauthorized`.
- [ ] Invalid payload returns `400 Bad Request` with structured validation error messages.
- [ ] Successful execution runs atomically within a DB transaction and returns `200` or `201`.
- [ ] Data is correctly persisted/updated in the database.
- [ ] [For UI]: Loading state (Skeleton/Spinner) and error states are handled properly.

---

### 🛠️ Technical Tasks
- [ ] Create Zod input validation schema
- [ ] Implement service layer / business logic
- [ ] Create API Route Handler / Server Action with role-based access control (RBAC)
- [ ] Add DB indexes / optimize queries
- [ ] Write unit and integration tests (covering happy path and error states)
- [ ] [For UI]: Build FSD components and connect React Query / Server Actions

---

### 📚 Tech Details & References
- **Layers & Modules:** `src/server/services/...` or `src/features/...`
- **Database Models:** `prisma/schema.prisma` -> `ModelName`
- **Spec Reference:** `docs/specs/...`
```

---

## 💡 Example 1: Backend / API Feature

**Card Title:** `[FEAT] Implement SM-2 Word Review Evaluation & Interval Calculation API (3SP)`  
**Labels:** `✨ Feature`, `🛠️ Backend`

```markdown
### 🎯 User Story / Goal
As a **client application (Web or Mobile)**,  
I want to **submit a card review rating (1-4) to the evaluation endpoint**,  
so that **the server calculates the next review date using the SM-2 algorithm and stores the review history**.

---

### 📌 Prerequisites
- [x] Database schema ready: `VocabularyCard` and `CardReviewHistory`

---

### ⚙️ Requirements & API Contracts
- **Endpoint:** `POST /api/vocabulary/study/evaluate`
- **Auth:** Active session required (`getAuthSession()`), verify user ownership of the card.
- **Request Body:**
  ```json
  {
    "cardId": "cuid_string",
    "rating": 3 // 1: Again, 2: Hard, 3: Good, 4: Easy
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "cardId": "cuid_string",
    "nextReviewDate": "2026-08-25T10:00:00Z",
    "interval": 4,
    "repetitions": 2,
    "easeFactor": 2.5
  }
  ```
- Return `404 Not Found` if card does not exist.
- Return `403 Forbidden` if user attempts to evaluate another user's private card.

---

### 📋 Acceptance Criteria
- [ ] Request without auth token returns `401 Unauthorized`.
- [ ] Invalid `rating` (e.g., 0 or 5) returns `400 Bad Request`.
- [ ] Calculation of `easeFactor` follows the SM-2 specification ($EF' = EF + (0.1 - (5 - grade) \times (0.08 + (5 - grade) \times 0.02))$).
- [ ] Updating `VocabularyCard` and creating `CardReviewHistory` occurs in an atomic transaction (`prisma.$transaction`).
- [ ] API endpoint execution time under load is < 60ms.

---

### 🛠️ Technical Tasks
- [ ] Implement pure calculation function `calculateNextReview(currentStats, rating)`
- [ ] Create service `VocabularyStudyService.evaluateCard(userId, cardId, rating)`
- [ ] Add Route Handler in `src/app/api/vocabulary/study/evaluate/route.ts`
- [ ] Write unit tests for SM-2 edge cases (100% calculation coverage)
- [ ] Write integration test for the API route with mock DB
```

---

## 💡 Example 2: Full-Stack Feature

**Card Title:** `[FEAT] Create and Persist New Vocabulary Deck with Tags (3SP)`  
**Labels:** `✨ Feature`, `🎨 Frontend`, `🛠️ Backend`

```markdown
### 🎯 User Story
As a **student or teacher**,  
I want to **create a new vocabulary deck with a name, description, and CEFR level**,  
so that **I can organize my learning materials by topic**.

---

### 📋 Acceptance Criteria
- [ ] Deck title is validated: required, between 3 and 60 characters.
- [ ] Supports selecting cover color/image and CEFR level (A1–C2).
- [ ] Deck is persisted with the current `organizationId` and `authorId`.
- [ ] On success, returns `201 Created` and updates the UI without a full-page reload.

---

### 🛠️ Technical Tasks
- [ ] [Backend] Add Zod schema `CreateDeckSchema` and Server Action `createDeckAction`
- [ ] [Backend] Validate free-tier organization limits for deck count
- [ ] [Frontend] Create `CreateDeckModal` component in `src/features/create-deck`
- [ ] [Frontend] Implement optimistic updates and cache invalidation via React Query
```
