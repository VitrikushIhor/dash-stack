# Dash English Platform

A multi-tenant English learning platform built on top of `dash-stack`.  
It combines LMS-style classrooms with powerful vocabulary/SRS tools and test/lesson builders, aiming to cover all core English skills (grammar, vocabulary, reading, listening, writing, speaking, exam prep) in a single product.

---

## Vision

Most existing English products focus on only part of the learning journey:  
- Flashcard/SRS apps (Quizlet, Anki, Quenti) focus on vocabulary.  
- LMS/lesson platforms focus on grammar, reading, listening, or exam prep.  

**Dash English Platform** aims to provide a unified environment where:

- Learners, teachers, and teams work inside shared workspaces (organizations).  
- All skills (grammar, vocab, reading, listening, writing, speaking) and exam practice live in one platform.  
- Custom content (lessons, tests, vocabulary sets) can be created, shared, and tracked per classroom/team.  

---

## Core Concepts

These concepts are mapped onto the existing `dash-stack` domain where possible:

- **User** – any person using the platform (student, teacher, admin).  
- **Organization** – workspace/school/classroom hub where people learn together.  
- **Membership** – participation and role within an organization (OWNER, ADMIN, MEMBER, GUEST).  
- **Course / Track** – structured learning path (e.g. “B1 Grammar”, “IELTS Reading”, “IT English Vocabulary”).  
- **Task** – assignment/learning item for a user or group (lesson, test, vocab session, homework).  
- **CalendarEvent** – scheduled lessons, test deadlines, and reminders.  
- **Vocabulary Deck / Study Set** – collection of words/phrases for SRS‑based study.  
- **Lesson** – unit of content (grammar rule, reading text, listening activity, etc.).  
- **Question / TestTemplate** – reusable questions and test definitions used in assessments.  

---

## Feature Overview (Epics)

This section lists the main functional areas that can be split into epics and sprints.

### 1. Users & Organizations

**Goal:** Multi-tenant workspaces where teachers and learners collaborate.

- User registration/login (email+password, later OAuth).  
- User profile: name, avatar, native language, learning goals (exam/general/IT English), current CEFR level (A1–C1).  
- Organizations: create/manage workspaces representing schools, classes, or teams.  
- Roles per organization via `Membership` and `OrgRole`:  
  - OWNER/ADMIN → teacher/organization admin.  
  - MEMBER → student.  
  - GUEST → limited access member (trial, read-only).  

### 2. Courses & Tracks

**Goal:** Structured learning paths per organization.

- Create courses/tracks inside an organization:  
  - Fields: title, description, level (A1–C1), type (grammar/vocab/exam/IT English), visibility (public/private).  
- Attach lessons, tests, and vocabulary sets to a course.  
- Enroll members of an organization into specific courses.  
- Course progress tracking for each user (percentage completed, key milestones).

### 3. Vocabulary & SRS Module

**Goal:** Decoupled, powerful flashcard and spaced repetition system similar to Quizlet/Quenti/Anki, integrated with classes and courses via read-only references.

#### 3.1 Study Sets & Flashcards
- User-centric decks: any authenticated user creates personal decks with visibility controls (`PRIVATE`, `UNLISTED`, `PUBLIC`).
- Flashcard model (1-to-N with Deck):
  - term, definition, example sentence, optional image URL, position ordering.
- Image search & attachment: instant search of royalty-free stock photos (Unsplash) to attach illustrative images to cards.
- Fork / Clone: one-click cloning of accessible decks into personal libraries for custom editing.

#### 3.2 Import / Export
- Bulk import terms by pasting Tab/Comma-delimited text (Quizlet format).
- Instant export as CSV, TSV, or JSON.

#### 3.3 Study Modes
- **Flashcards** – classic front/back flip with audio pronunciation (Web Speech API) and star marking.
- **Learn / Adaptive** – guided recall switching from Multiple Choice to Written Typing.
- **Practice Test** – auto-generated graded test with multiple question formats and score breakdown.
- **Match Game** – interactive timed tile-matching grid (term ↔ definition) with deck leaderboards.

#### 3.4 Spaced Repetition (SRS) & Progress
- 5-Box Leitner scheduling algorithm with interval progression (1, 3, 7, 14, 30 days).
- Daily due reviews counter for student dashboards (`/reviews/due`).
- Starred cards filter: practice challenging terms exclusively across any study mode.

#### 3.5 LMS Integration & Sharing
- Decoupled references: courses (`CourseDeck`) and tasks (`Task.deckId`) reference decks without owning them.
- Public discovery catalog with keyword, level, and tag filters.

### 4. Lessons & Content

**Goal:** Full lesson support like Test-English/British Council – grammar, reading, listening, etc.

- Lesson model with basic fields:  
  - title, type (grammar/vocab/reading/listening/writing/speaking), CEFR level, body/content.  
- Attach lessons to courses and optionally to specific tasks.  
- Lesson content can include:  
  - prose explaining rules/concepts, examples;  
  - embedded media (audio, video, images);  
  - inline exercises linked to questions, tests, and decks.  
- Unit/section structure per course (grouping multiple lessons).  
- Marking lessons as completed per user, contributing to course progress.

### 5. Assessment & Test Builder

**Goal:** Flexible test builder and question bank for teachers and advanced learners.

#### 5.1 Question Bank

- Question model with types:  
  - multiple choice, gap-fill, matching, true/false, short answer.  
- Fields: prompt, options, correct answers, explanation/feedback, level, skill (grammar/vocab/reading/listening/writing/exam type).  
- Questions tagged by course and organization for reuse.  

#### 5.2 Test Templates

- TestTemplate model:  
  - title, description, duration, max attempts, options for randomization and feedback visibility.  
- Link one test template to many questions (via join table).  
- Support for different exam styles (FCE/IELTS/TOEFL-like sections) in later iterations.

#### 5.3 Test Builder UI

- Teachers/advanced users can:  
  - search and select questions from the bank;  
  - create new questions inline;  
  - configure test settings (time limit, allowed attempts, feedback mode).  

#### 5.4 Test Attempts & Feedback

- TestAttempt per user:  
  - score, completion time, duration, attempt number.  
- QuestionAttempt:  
  - chosen answer(s), correctness flag, per-question feedback.  
- After test completion:  
  - summary view (score, topic breakdown);  
  - detailed view (each question, user answer, correct answer, explanation).  

### 6. Assignments & Tasks

**Goal:** Use existing `Task` domain to represent assignments and learning items.

- Task types: LESSON, TEST, VOCAB_SET, HOMEWORK (via enum or type field).  
- Link tasks to courses and specific content:  
  - LESSON → a Lesson id;  
  - TEST → a TestTemplate id;  
  - VOCAB_SET → a Deck id.  
- Assign tasks to individual users or entire organizations/groups via `Membership`.  
- Task status lifecycle: PLANNED, UPCOMING, COMPLETED (already present in schema).  
- Student view:  
  - task list with filters by status and due dates;  
  - clicking a task triggers the appropriate learning flow (open lesson, start test, start vocab session).  

### 7. Calendar & Scheduling

**Goal:** Scheduling of lessons, tests, and deadlines using existing `CalendarEvent` domain.

- Create calendar events tied to tasks and organizations:  
  - TASK, MEETING, DEADLINE, REMINDER.  
- Display per-organization calendar:  
  - upcoming lessons, tests, vocab sessions, meetings.  
- Student calendar view:  
  - events relevant to the user’s memberships and assigned tasks.  
- Notifications (later):  
  - email/in-app reminders for upcoming events and deadlines.

### 8. Progress, Leaderboards & Analytics

**Goal:** Make progress and performance visible for both students and teachers.

#### 8.1 Student Progress

- “My progress” dashboard:  
  - course completion percentages;  
  - vocabulary stats (words learned, review accuracy);  
  - test history (scores, attempts, improvement over time).  
- Per-course breakdown:  
  - which lessons/tests are done, which are pending;  
  - where errors cluster (e.g. specific grammar topics).  

#### 8.2 Class & Organization Analytics

- Teacher/owner dashboards:  
  - average scores per test and course;  
  - completion rates per assignment and course;  
  - engagement metrics (logins, sessions, tasks completed).  
- Export/reporting:  
  - CSV/Excel exports for progress and results.  

#### 8.3 Leaderboards

- Leaderboards for:  
  - vocabulary decks (Match/Test performance);  
  - courses (overall score/completion);  
  - organization-level (gamified badges/ranks in later phases).

### 9. Communication & Collaboration (Later Phase)

**Goal:** Basic social features around classes and content.

- Announcements per organization/course:  
  - teacher posts updates, deadlines, news.  
- Comments on lessons/tests/decks:  
  - questions, clarifications, discussion threads.  
- Basic class chat (later):  
  - text channel per course/organization.  

### 10. AI & Advanced Features (Later Phase)

**Goal:** Use AI to enhance grading, feedback, and content generation.

- AI-powered grading for open-ended answers (essays, long writing).  
- Personalized feedback:  
  - identify weak grammar/vocab areas and suggest targeted practice.  
- AI assistant within lessons:  
  - context-aware chat about current topic/course.  
- Auto-generation of vocabulary sets from input texts:  
  - upload text → extract key vocabulary → create deck.  

---

## MVP Scope (First Release)

The initial MVP can focus on a subset of the above:

1. Users & Organizations  
   - Basic auth, profiles, organizations, roles.

2. Courses & Tracks  
   - Create courses, attach lessons and decks.

3. Vocabulary & SRS (core subset)  
   - Decks and words.  
   - Study, Learn, Flashcards, simple Test modes.  
   - Basic per-user deck progress (no complex SRS yet).  

4. Lessons & Content  
   - Simple lesson pages with text + examples.  
   - Mark lessons as completed.

5. Assessment & Test Builder (minimal)  
   - Question bank with MCQ + gap-fill.  
   - Simple test templates.  
   - TestAttempts + basic feedback.

6. Assignments & Tasks  
   - Use existing Task model to assign lessons/tests/decks to users.  
   - Basic task list and completion tracking.

7. Calendar & Scheduling (basic)  
   - Create events for tasks, show per-organization calendar.

Progress, leaderboards, AI features, folders, advanced analytics, and communication features can be added in later iterations once the core flows are stable.

---

## Tech Stack (High-Level)

> This section is only to give context; detailed installation/setup stays in backend/frontend READMEs.

- Backend: NestJS, PostgreSQL, Prisma (based on existing `dash-stack` backend).  
- Frontend: Next.js (App Router), TypeScript, modern UI components.  
- Multi-tenancy: organizations and memberships as logical tenants.  
- Deployment: Docker-based, suitable for cloud environments (AWS, etc.).

---