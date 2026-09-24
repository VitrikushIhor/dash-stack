# ADR-002: Consistent state management for study modes

## Status
Accepted

## Date
2026-09-23

## Context
Match used a React reducer and action hooks, Flashcards combined local React state,
refs and progress effects, and Learn used a scoped Zustand store. Their different
lifecycle guards made retry, identity changes and unmount behavior harder to reason
about. Flashcards also needed synchronous effect updates merely to coordinate state.
Zustand otherwise has little adoption in the application and should not be required
by the study modes.

## Decision
Use framework-independent controllers for all three modes. Controllers implement a
small immutable snapshot API (`getState` and `subscribe`) and React reads it through
`useSyncExternalStore`. Each mode follows the same separation of responsibilities
inside `features/study-vocab/model`:

- `game` (Match/Flashcards) or `answer` (Learn) holds mode-specific interaction and
  transition logic. Match retains its tested reducer as a transition function;
  React no longer owns that reducer's state.
- `session` holds typed contracts, controller factories, storage where applicable,
  and the React orchestration and synchronization hooks.
- Controllers own observable state and synchronous guards. Hooks bind them to React,
  current identity and query invalidation. Synchronization modules call server
  actions and report failures to the controller or the player's explicit retry state.
- `StudyControllersProvider` supplies controller factories through Context. Its
  default factories provide normal runtime behavior; tests and alternate hosts can
  override individual factories without mocking implementation modules.
- `model/shared/session-lifecycle.ts` and `use-session-store.ts` provide the common
  activation/deactivation boundary for asynchronous sessions. A revoked lease may
  not update the active session. Synchronous gameplay state needs no async lease.
- Controllers are per player/session, never module singletons. Match session scope
  includes user, deck and filters. Learn retains its user/session storage scope.
  Flashcards keeps unresolved-identity results in memory until ownership is known.
- Preserve established exports through `features/study-vocab/index.ts`. Internal
  consumers import the owning `game` or `session` module directly; intermediate
  forwarding files are not retained. The Flashcards widget uses
  `useFlashcardSession`; the old `useStudySession` export remains a public
  compatibility alias, not a shared implementation.

Use direct server-action calls in synchronization modules. Do not schedule state
coordination with `queueMicrotask`, promise deferral or timers. Match animation
and Flashcards bounded retry delays remain because they implement product behavior.

## Preserved differences

The modes share an implementation pattern, not one universal state machine:

- Match requires a server-created session, records pair attempts, and obtains the
  final duration from the server. Its creation guard survives effect replay to
  avoid issuing another create request; request revisions reject responses after
  restart and store deactivation rejects responses from an abandoned scope.
- Flashcards persists completed results as individually idempotent queued attempts.
  It retains the existing maximum of three submission attempts and retry delays.
- Learn persists a session snapshot and synchronizes each answer before advancing.
  Existing mastery, reconciliation, attempt IDs and storage formats remain intact.

Client lifecycle guards prevent stale state updates and subsequent sends. They
cannot cancel an already accepted HTTP request; backend idempotency remains required.

## Alternatives

Keeping three state-management approaches would leave lifecycle behavior scattered
across React effects, refs and external stores. A universal study-mode controller
would combine incompatible domain transitions and persistence policies. Using
Zustand solely to implement the small observable controller contract would retain an
unnecessary dependency. These alternatives were rejected.

## Consequences

All modes use the same controller/Context/hook/synchronization pattern without new
dependencies or backend changes. Study modes no longer import Zustand. Regression
coverage includes DI factory overrides, root Strict Mode replay, Match scope changes,
in-flight retry deduplication and Flashcards unmount behavior.
