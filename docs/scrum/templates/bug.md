# Template: Bug Report (`[BUG]`)

Used for reporting and fixing software defects, API errors, database anomalies, authorization failures, or unexpected UI behavior.

---

## 🏷️ Card Configuration
- **Title Prefix:** `[BUG]`
- **Labels:** `🐛 Bug`, `🔥 High Priority` (if blocker), + (`🛠️ Backend` / `🎨 Frontend`)
- **Story Points:** Typically `1SP` or `2SP`

---

## 📄 Universal Template (Copy & Paste)

```markdown
### 🐛 Bug Description
A clear and concise description of what is broken, throwing 500 errors, or deviating from specifications.

---

### 🔁 Steps to Reproduce (or cURL)
1. Send request or navigate to `[URL / Endpoint]`
2. Input payload / Parameters `[Headers / Body / UI clicks]`
3. Specific state `[User role, DB record state]`

---

### ❌ Actual Result & Logs
- **Status code / UI:** `500 Internal Server Error` / Blank screen / NaN
- **Error Stacktrace:**
```text
[Paste server stacktrace or browser console error here]
```

---

### ✅ Expected Result
What should happen instead (e.g., *return 400 with validation message, or save record idempotently without duplicates*).

---

### 📋 Acceptance Criteria (Fix Verification)
- [ ] Bug is no longer reproducible following the reproduction steps.
- [ ] A regression unit or integration test has been added to prevent reoccurrence.
- [ ] Adjacent endpoints and services continue to function without regressions.

---

### 🛠️ Technical Investigation & Fix Tasks
- [ ] Locate the root cause in `src/server/...` or `src/features/...`
- [ ] Fix logic / add database transaction / improve payload validation
- [ ] Run test suite to verify no regressions
```

---

## 💡 Example 1: Backend / API Bug

**Card Title:** `[BUG] Fix Race Condition on Concurrent Test Submission Creating Duplicate Attempts (2SP)`  
**Labels:** `🐛 Bug`, `🛠️ Backend`, `🔥 High Priority`

```markdown
### 🐛 Bug Description
When a student double-clicks the "Submit Test" button (or poor connectivity triggers 2 concurrent POST requests), two separate records are inserted into `TestSubmission` for the same attempt, corrupting scoring statistics.

---

### 🔁 Steps to Reproduce
1. Target endpoint: `POST /api/tests/test_123/submit`
2. Send two concurrent asynchronous requests with identical `testAttemptId`:
```bash
curl -X POST http://localhost:3000/api/tests/test_123/submit -d '{"attemptId":"att_1"}' &
curl -X POST http://localhost:3000/api/tests/test_123/submit -d '{"attemptId":"att_1"}' &
```

---

### ❌ Actual Result
Two records are created in `TestSubmission` with status `COMPLETED`, and points are awarded twice.

---

### ✅ Expected Result
The first request completes the attempt with `200 OK`. The second request returns `409 Conflict` ("Attempt already submitted") or idempotently returns the existing submission.

---

### 📋 Acceptance Criteria
- [ ] Parallel/duplicate submissions never create duplicate database records.
- [ ] Submission logic is wrapped in a transaction with proper isolation or enforced via `@@unique([testId, attemptId])`.
- [ ] Concurrency integration test passes.

---

### 🛠️ Technical Investigation & Fix Tasks
- [ ] Add composite unique constraint `@@unique([userId, testAttemptId])` to Prisma schema
- [ ] Update `TestSubmissionService.submit()` to check existing state inside transaction
- [ ] Add concurrency test using `Promise.all([submit(), submit()])`
```

---

## 💡 Example 2: Frontend / Client Bug

**Card Title:** `[BUG] Spaced Repetition Session Progress Resets to First Card on Page Reload (1SP)`  
**Labels:** `🐛 Bug`, `🎨 Frontend`

```markdown
### 🐛 Bug Description
When reloading the page (F5) during an active flashcard session, the card counter resets to 1, losing the active session state.

---

### 📋 Acceptance Criteria
- [ ] Active session state is saved to `localStorage` / synced with the server.
- [ ] On page reload, user resumes from the exact card where they left off.
- [ ] Unit test verifies session restoration logic.
```
