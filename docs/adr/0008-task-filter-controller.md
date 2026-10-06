# ADR-0008: Coordinate task filters through a URL controller

- Status: Accepted
- Date: 2026-10-05
- Scope: Task filtering and shared filter UI

## Context

The task toolbar and table updated the same URL parameters with different pagination rules. A date-only filter did not expose Reset. URL and table adapters duplicated faceted and date-range UI, and date adapters assumed unvalidated filter values. The date picker also discarded an incomplete range and serialized the final date at midnight.

## Decision

Keep the URL as the filter source of truth. `useTaskFiltersController` coordinates toolbar and table operations: filter and search changes reset page to one in the same URL update; reset clears every filter while preserving page size and unrelated parameters. Text search retains the existing 300 ms throttle. No Context, event bus or mediator class is required.

Move controlled `FacetedFilter` and `DateRangeFilter` presentation to Shared. They receive typed values and callbacks, with optional facet counts. URL and TanStack adapters own conversion. Shared date helpers validate unknown timestamp, ISO string and Date inputs before rendering or comparing them. The date-range table filter uses generic row types rather than `any`.

Calendar selection encodes the start of the first day and the end of the last day in the browser's timezone. A partial selection retains its first date. Both adapters use the same serialization; server parsing forwards those exact instants as ISO strings rather than recalculating boundaries in the server timezone. Existing URLs retain their explicit timestamp semantics, including legacy midnight upper bounds, until a new selection is made.

## Consequences

Filtering behavior is consistent across toolbar and table without coupling Shared UI to task data, URL state or TanStack columns. Invalid URL dates no longer cause formatting exceptions, and Reset remains available for nonempty date parameters. No database, API endpoint or dependency changes are required.

Regression tests cover date-only Reset, atomic page resets, preservation of unrelated URL parameters, partial selection, inclusive final-day bounds, server transport and facet selection/counts. Browser interaction remains a separate validation step.
