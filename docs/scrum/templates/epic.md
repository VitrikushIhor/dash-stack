# Template: Epic (`[EPIC]`)

Used for large-scale feature sets, business modules, or architectural milestones that span multiple sprints and decompose into individual User Stories (`[FEAT]`) and Technical Tasks (`[TECH]`).

---

## 🏷️ Card Configuration
- **Title Prefix:** `[EPIC]`
- **Labels:** `🏔️ Epic`, `📄 Docs`
- **List Placement:** `💡 Backlog` or `📋 To Do`

---

## 📄 Universal Template (Copy & Paste)

```markdown
### 🏔️ Epic Overview & Business Goal
High-level description of the module or domain being built, the target users, and the strategic value it brings to the platform.

---

### 🎯 Key Goals (In-Scope)
- [ ] Primary Goal 1
- [ ] Primary Goal 2
- [ ] Primary Goal 3

---

### 🚫 Out of Scope
- Capabilities explicitly NOT included in this epic (deferred to future phases).

---

### 🧩 Story & Task Decomposition
- [ ] `[TECH] Task Name 1 (2SP)`
- [ ] `[FEAT] Feature Name 2 (3SP)`
- [ ] `[FEAT] Feature Name 3 (5SP)`
- [ ] `[FEAT] Feature Name 4 (3SP)`

---

### 📚 Specifications & Architecture References
- **Feature Spec:** `docs/specs/...`
- **Design / Figma:** [Link to designs]
```

---

## 💡 Real-World Example

**Card Title:** `[EPIC] Vocabulary & Spaced Repetition System (Vocabulary & SRS)`  
**Labels:** `🏔️ Epic`, `📄 Docs`

```markdown
### 🏔️ Epic Overview & Business Goal
Build an end-to-end vocabulary learning and retention module powered by the SuperMemo SM-2 spaced repetition algorithm. The system enables students and teachers to create custom decks, import terms, practice pronunciation, and track long-term memory consolidation.

---

### 🎯 Key Goals (In-Scope)
- [ ] Personal and shared vocabulary deck management (CRUD).
- [ ] Interactive two-sided flashcards with audio pronunciation and transcription.
- [ ] Spaced repetition scheduling engine (SRS SM-2).
- [ ] Learning analytics and daily retention review targets.

---

### 🚫 Out of Scope
- AI-generated deck creation (AI Deck Generator) — planned for Phase 2.

---

### 🧩 Story & Task Decomposition
- [ ] `[TECH] Create Prisma Schema & Migrations for VocabularyDeck and Card (2SP)`
- [ ] `[FEAT] Vocabulary Deck List UI & Create Deck Modal (3SP)`
- [ ] `[FEAT] Word Term Editor with Auto-Suggestions (3SP)`
- [ ] `[FEAT] SM-2 Flashcard Review Session Execution API & Engine (5SP)`
- [ ] `[FEAT] Daily Retention & Review Streak Dashboard Widget (2SP)`

---

### 📚 Specifications & Architecture References
- **Feature Spec:** `docs/specs/vocabulary/FEATURE-SPEC-vocabulary.md`
```
