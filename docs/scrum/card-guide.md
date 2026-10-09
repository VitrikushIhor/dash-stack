# Scrum Card Guide for Trello (Full-Stack, Backend & Frontend)

This guide defines the engineering standard for structuring and detailing Trello cards across **Full-Stack**, **Backend**, and **Frontend** workflows to maintain high code quality, architectural clarity, and fast Code Review / QA turnaround.

---

## 🏗️ Anatomy of an Ideal Card

| Card Element | Purpose | Example / Format |
| :--- | :--- | :--- |
| **Title** | Action + Object + Context (+ Estimate) | `[FEAT] Implement REST API for SM-2 Word Review Sessions (3SP)` |
| **Labels** | Type + Domain + Priority | `✨ Feature`, `🛠️ Backend`, `🔥 High Priority` |
| **User Story / Goal** | Context: Who benefits and what problem is solved | "As a [role], I want [action], so that [benefit]" or Tech Goal |
| **Prerequisites** | What must be ready before starting (dependencies) | `Prisma schema from task #12`, `Third-party API key` |
| **Requirements** | Expected system behavior / API contracts | HTTP codes, payload validation, business logic rules |
| **Acceptance Criteria** | Pass/Fail criteria for QA & Review | Checklist (Pass/Fail) or `Given/When/Then` (BDD) |
| **Tasks Checklist** | Implementation breakdown for the developer | Checklist of coding steps, migrations, test files |
| **Tech Details** | Architecture, DB models, FSD layers, API specs | Endpoints, DB tables, types, error status codes |
| **Assignee (Member)** | Responsible developer | Single owner for clear accountability |

---

## 1. Card Title Formula

Write titles as an **action**, not a vague topic. Always specify the domain when helpful.  
**Formula:** `[Prefix] Verb + Object + Short Context (Story Points)`

### Domain Examples:
- 🛠️ **Backend / API:** `[FEAT] Create SM-2 Repetition Interval Calculation API (3SP)`
- 🗄️ **Database:** `[TECH] Add Prisma Models for VocabularyDeck and VocabularyCard with Indexes (2SP)`
- 🔒 **Security / Auth:** `[FEAT] Implement Organization RBAC Middleware for Route Protection (2SP)`
- 🎨 **Frontend / UI:** `[FEAT] Build Flashcard Review Interactive Widget (3SP)`
- 🐛 **Backend Bug:** `[BUG] Fix Race Condition on Concurrent Test Submission (2SP)`
- ⚡ **Performance:** `[TECH] Eliminate N+1 Query on Public Deck List Endpoint (2SP)`

---

## 2. User Story & INVEST Quality Criteria

### For Product & User-Facing Tasks:
```markdown
### 🎯 User Story
As a **student on the platform**,  
I want to **receive words based on the spaced repetition algorithm**,  
so that **I only spend time reviewing words I am at risk of forgetting**.
```

### For Purely Technical & Backend Tasks:
```markdown
### ⚙️ Technical Goal & Context
Implement an isolated calculation service for the Ease Factor to ensure transaction safety and keep API response times under 50ms.
```

### INVEST Quality Checklist (Pre-Sprint Validation):
Before moving a card to the sprint backlog (`📋 To Do`), verify it against the **INVEST** principle:

1. **I (Independent):** The card can be developed, tested, and shipped independently (e.g., Backend API can be completed and tested before UI is ready).
2. **N (Negotiable):** Defines the "what" and "why" while leaving room for the engineering implementation details.
3. **V (Valuable):** Delivers measurable value (to the user, business, performance, or system security).
4. **E (Estimable):** The team understands the scope well enough to assign Story Points (1, 2, 3, 5, 8).
5. **S (Small):** Fits within a single sprint (aim for 1–3 days of developer effort).
6. **T (Testable):** Has clear, verifiable Acceptance Criteria.

---

## 3. Requirements & API Contracts

Specify system behavior as verifiable, objective technical facts:

### Backend / API Example:
- Accept `POST /api/vocabulary/study/evaluate` with body `{ cardId: string, rating: 1 | 2 | 3 | 4 }`.
- Validate incoming payload with a Zod schema (return `400 Bad Request` on failure).
- Verify user authorization and deck ownership (return `403 Forbidden` if unauthorized).
- Calculate updated `interval`, `repetitions`, `easeFactor`, and `nextReviewDate`.
- Persist updates inside an atomic database transaction (`prisma.$transaction`).
- Return the updated card object with status `200 OK`.

---

## 4. Acceptance Criteria Formats

Acceptance criteria define what "DONE" means for QA engineers, reviewers, and stakeholders.

### Format 1: Pass/Fail Checklist (Backend & API)
```markdown
### 📋 Acceptance Criteria
- [ ] Endpoint returns `401 Unauthorized` for unauthenticated requests.
- [ ] Invalid `rating` (e.g., 0, 5, or a string) returns `400 Bad Request` with structured error details.
- [ ] Successful rating returns `200 OK` and correctly updates `nextReviewDate` via the SM-2 formula.
- [ ] Review entry is saved to `CardReviewHistory` atomically within the same DB transaction.
- [ ] Endpoint response time under load is < 100ms (verified via query execution plan and indexes).
```

### Format 2: Given / When / Then (BDD — Complex Logic & Transactions)
```markdown
### 📋 Acceptance Criteria (BDD)
- **Scenario 1: Resetting a forgotten word (Rating = 1 / Again)**
  - **Given:** A card had `repetitions = 5` and `interval = 12`.
  - **When:** The user submits `rating = 1` (Again).
  - **Then:** The system resets `repetitions = 0`, sets `interval = 1`, recalculates `easeFactor`, and schedules `nextReviewDate = now()`.

- **Scenario 2: Attempting to evaluate another user's private card**
  - **Given:** A card belongs to `User_A`.
  - **When:** `User_B` attempts to submit a rating for this card.
  - **Then:** The server responds with `403 Forbidden` and no state changes in the database.
```

---

## 5. Acceptance Criteria vs Tasks Checklist

| Dimension | Acceptance Criteria (AC) | Tasks Checklist (Developer) |
| :--- | :--- | :--- |
| **Audience:** | QA, Reviewer, Product Owner | Developer |
| **Focus:** | **WHAT** must work (contract, outcome) | **HOW** to build it (code, migrations, steps) |
| **Backend:** | "API returns 400 when cardId is missing" | "Create Zod schema `EvaluateCardSchema` in `src/server/schemas`" |
| **DB:** | "Cascade delete cards when a deck is removed" | "Add `onDelete: Cascade` in `prisma/schema.prisma` and run migration" |
| **Frontend:** | "Display error toast on 500 server response" | "Handle error state in React Query hook" |

---

## 6. Definition of Done (DoD)

Standard quality checklist required for every card before closing:
1. ✅ Code adheres to project architectural standards (Next.js App Router, FSD, Prisma Best Practices).
2. ✅ Input validation and edge-case/error handling are implemented.
3. ✅ Unit and integration tests are written and passing.
4. ✅ No N+1 database queries; composite indexes applied where necessary.
5. ✅ Pull Request passes CI, linter, and SonarQube quality gate without new warnings or critical bugs.
6. ✅ PR is reviewed and approved.
7. ✅ All Acceptance Criteria are verified and checked.
8. ✅ Code is merged into the target development branch (`dev`).
