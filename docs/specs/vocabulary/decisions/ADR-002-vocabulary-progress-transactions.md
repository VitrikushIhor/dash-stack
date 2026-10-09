# ADR-002: Transactional Vocabulary progress and star writes

## Status

Proposed for review

## Date

2026-09-07

## Context

A Leitner review derives its next state from the current box and counters. Reading
that state outside the write transaction loses reviews under concurrent requests.
Committing bulk chunks independently also permits a partially persisted batch.
Star writes share the progress record and can overwrite a concurrent review.

## Decision

- Application use cases execute through `StudyProgressTransactionPort`. The port
  supplies transaction-scoped repository operations; no Prisma types enter the
  application or domain layers.
- The adapter uses PostgreSQL `Serializable` isolation. Deck access, card
  membership, progress reads, domain calculations, all writes and response reads
  belong to the same transaction.
- Review batches reject duplicate card IDs before persistence. Every submitted
  card must belong to the requested deck. A learner need not own a published
  public/unlisted deck; `DeckAccessPolicy` decides eligibility.
- Bulk writes use parameterized SQL in chunks of 100, inside one transaction.
- Write conflicts retry the entire callback with fresh entities, up to four
  attempts, with 25/50/100 ms backoff. Each transaction has a 5-second acquisition
  limit and a 10-second execution limit. Exhaustion returns a domain conflict
  (`409`); other failures propagate without retry. Callbacks must have no external
  side effects.
- Star operations use the same transaction boundary. A newly created progress
  record has no review schedule. Only a recorded answer schedules a review.

## Alternatives Considered

- A transaction around writes only prevents partial batches but still overwrites
  concurrent reviews calculated from stale state.
- Row locks on progress alone do not protect the first review, because no row
  exists yet. Serializing on the deck would unnecessarily block different users.
- Optimistic version columns would require schema changes and an additional retry
  protocol. Serializable transactions reuse the current schema and domain engine.

## Consequences

Domain calculations remain independently testable. Concurrent reviews preserve
counters, star writes preserve SRS state, and failures roll back every chunk.
Contention can return a retryable conflict instead of silently losing progress.
A repeated HTTP request remains a separate review; transaction retry only retries
rolled-back work and is not a network idempotency contract.

Due means an existing progress record with `nextReviewAt <= now`, using absolute
instants. No progress or a null schedule is not due. Combined due/starred filters
require both predicates on the same user's progress. Historical unreviewed rows
with a non-null schedule require a separately reviewed data repair if present;
the application does not silently rewrite historical data.
