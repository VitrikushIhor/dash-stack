# ADR-0009: Load study modes through a shared registry

- Status: Accepted
- Date: 2026-10-07
- Scope: Frontend vocabulary study routes

## Context

Flashcards, Learn, and Match have separate URLs but share data loading and error handling. A dispatcher with eager imports loads dependencies for every mode. Separate view pages avoid those imports but duplicate composition entrypoints.

## Decision

Use one App Router `[mode]/page.tsx` for the existing study URLs. Validate the mode before loading data and return 404 for unknown values. Preserve mode-specific metadata through `generateMetadata`. The route passes its mode to the shared server StudyPage, which loads data, handles errors, creates the session key, and validates Match selections. A client StudyModeContent selects the widget through a typed registry with static next/dynamic import paths, following the calendar approach. Show StudySessionSkeleton while a mode loads. Keep session identity as the component key so filter changes reset the session.

## Consequences

Modes share one composition contract and load their UI through separate chunks. Shared client dependencies remain shared. First Load JS excludes deferred chunks and must be considered together with the selected mode's download. Route prefetching and mode loading are separate concerns. Use narrow `session-ui`, `flashcards`, `match`, and `learn` public entrypoints so the shared loading UI does not eagerly import players. The Learn widget retains its deferred player through the dedicated `learn` entrypoint.
