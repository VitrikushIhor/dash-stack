# Scrum & Trello Process Documentation

This section defines the standards, workflows, templates, and rules for **Scrum** development on Trello for the **Dash English Platform** project.

---

## 📚 Table of Contents

1. 📖 **[Card Writing & Quality Guide](./card-guide.md)** — Detailed rules for structuring cards: title formula, INVEST quality criteria, writing Acceptance Criteria (AC), checklists, and the team Definition of Done (DoD).
2. 📋 **Ready-to-Use Templates:**
   - ✨ **[Feature / User Story Template](./templates/feature.md)** (`[FEAT]`)
   - 🐛 **[Bug Report Template](./templates/bug.md)** (`[BUG]`)
   - ⚙️ **[Technical Task Template](./templates/tech-task.md)** (`[TECH]`)
   - 🏔️ **[Epic Template](./templates/epic.md)** (`[EPIC]`)

---

## 📌 General Board Information

- **Platform:** Trello
- **Workspace:** `dash-english`
- **Development Board:** [Dash English Development](https://trello.com/b/Ka8MlE8C/dash-english-development)
- **Antigravity AI Integration:** Configured via Trello MCP Server (`~/.gemini/config/mcp_config.json`).

---

## 🔄 Development Lifecycle (Board Columns)

Tasks move from left to right through the following stages:

```
💡 Backlog ──▶ 📋 To Do ──▶ ⚡ In Progress ──▶ 🔍 Code Review ──▶ 🧪 Testing ──▶ ✅ Done
```

| № | Column | Description & Usage Rules |
| :-: | :--- | :--- |
| 1 | 💡 **Backlog** | **Product Backlog:** High-level epics (`[EPIC]`), business ideas, and future features. Items wait here until sprint planning. |
| 2 | 📋 **To Do** | **Sprint Backlog:** Tasks selected for the active sprint, fully refined with clear acceptance criteria and ready for development. |
| 3 | ⚡ **In Progress** | Tasks currently under active development. *(Recommendation: maximum 1–2 tasks in progress per developer)*. |
| 4 | 🔍 **Code Review** | Development is complete, and a Pull Request (PR) is open on GitHub. Awaiting code review and CI checks. |
| 5 | 🧪 **Testing** | Code is merged/deployed to the staging environment. Acceptance criteria and QA verification in progress. |
| 6 | ✅ **Done** | Task is fully completed, verified, and released according to the team Definition of Done (DoD). |

---

## 🏷️ Label System

The following color-coded labels are configured on the board for quick filtering and visual structure:

### 1. Task Types
- 🟣 **`🏔️ Epic`** (Purple) — Large modules or multi-sprint architectural milestones.
- 🟢 **`✨ Feature`** (Green) — New user-facing or API functionality (User Story).
- 🟡 **`⚙️ Tech Task`** (Yellow) — Technical tasks (refactoring, CI/CD, database schemas, optimizations).
- 🔴 **`🐛 Bug`** (Red) — Defect or bug fix.

### 2. Domains & Architecture Layers
- 🔵 **`🎨 Frontend`** (Sky Blue) — Client interface, React/Next.js components, FSD layers.
- 🟠 **`🛠️ Backend`** (Orange) — Server logic, API routes, Prisma, database operations, background jobs.
- 🟢 **`🧪 QA / Tests`** (Lime) — Unit, integration, and E2E testing.
- ⚫ **`📄 Docs`** (Black) — Documentation, architectural decision records (ADRs), specifications.

### 3. Priority
- 🩷 **`🔥 High Priority`** (Pink) — Blocking, urgent, or critical release tasks.
