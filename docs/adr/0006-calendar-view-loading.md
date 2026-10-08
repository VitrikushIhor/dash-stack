# ADR-0006: Load calendar views separately

- Status: Accepted
- Date: 2026-10-03
- Scope: Frontend calendar views

## Context

The five calendar routes shared one Client Component that statically imported every view. A production build reported 339 kB First Load JS for each calendar route, with the same initial asset list. The server pages also repeated the same task loading and error handling flow.

## Decision

Keep the existing App Router URLs. The `/calendar` route selects `month`; the `/calendar/[view]` route validates its URL segment and passes the selected view to the shared `renderCalendarPage`, which owns server task loading and error handling. Give the five calendar views one props contract and select them through a registry inside the `task-calendar` feature. Each registry entry uses `next/dynamic` with a static import path. The route's `loading.tsx` provides the calendar skeleton. The feature's public API exposes the registry component rather than statically exporting the five views.

## Consequences

The production build reports 333 kB First Load JS for both calendar route entries. The initial view-splitting build had 22,523 fewer raw bytes in each route manifest than the earlier static-import build, while the lazy-load manifest lists a separate chunk for each view. The active view still downloads its chunk: approximately 3 kB for month or year, or 17–18 kB including a shared chunk for day, week, or agenda. First Load JS alone does not measure total transferred bytes or interaction latency.

The shared dashboard layout and drag-and-drop provider remain eager. Keep the view modules separate only while bundle and runtime measurements justify the extra requests. Route prefetching and view chunk loading are separate concerns.
