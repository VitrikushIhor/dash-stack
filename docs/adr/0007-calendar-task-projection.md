# ADR-0007: Share calendar task grouping and isolate date moves

- Status: Accepted
- Date: 2026-10-05
- Scope: Frontend task calendar

## Context

Calendar tasks use one anchor (`dueDate`, otherwise `startDate`). The five views repeated date parsing, grouping and sorting, while some cards still calculated duration or multi-day positions. Year cells also duplicated indicator colors and lost the gray indicator when tasks overflowed. Drag payloads carried an entire task through an untyped library boundary.

## Decision

Keep the existing lazy view registry and its common props contract. Each active view builds a memoized task index, grouped by local calendar day and sorted by anchor time. Child cells receive only their day's tasks. Tasks without an anchor stay hidden; invalid anchors fail explicitly. Month renders the first three tasks and an overflow count. `useMonthLayout` now returns cells with their tasks instead of a separate position map.

Keep card layouts separate and share their color palette and small task indicators inside the feature. Use one badge variant contract (`mixed`, `dot`, `solid`). Agenda displays one anchor time; day/week cards retain their compact fixed height. Remove unused multi-day presentation contracts.

Drag metadata contains only a task id. Validate drag and day-target metadata with the existing Zod dependency, resolve tasks from the typed current list, and calculate date updates in a pure function. A move preserves local hours, minutes, seconds and milliseconds and updates only `dueDate`. Invalid or unrelated metadata and unknown task ids cannot trigger a mutation. The provider owns optimistic updates, rollback and error presentation. Drag previews use presentational cards without registering another draggable.

## Consequences

Grouping and sorting happen once per task-list change in the active view, rather than once per cell. Cards may still parse their own display time. Date grouping follows the browser's local timezone, preserving the existing policy. Server fetch ranges and backend date contracts remain unchanged. Month cells for adjacent months show tasks only if the caller supplied them; this decision does not expand server loading.

The DnD mutation callback accepts `CalendarTaskDateUpdate` rather than `Partial<Task>`. A start-only task receives a deadline when moved, matching the existing behavior. No time-slot target is supported because the current calendar has no producer for one. Multi-day or time-slot behavior needs an explicit future contract rather than dormant branches.

Regression tests cover anchor precedence, chronological grouping, month overflow, gray indicators, single-point Agenda time, metadata validation, local time across DST, optimistic updates and failed-save rollback. These checks do not establish real browser drag-and-drop behavior.
