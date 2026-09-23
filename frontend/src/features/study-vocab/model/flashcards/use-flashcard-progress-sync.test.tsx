import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type User, userKeys } from '@/entities/user'
import { submitProgressAction } from '../../server'
import {
  FlashcardProgressStatus,
  useFlashcardProgressSync,
} from './session/use-flashcard-progress-sync'

vi.mock('../../server', () => ({ submitProgressAction: vi.fn() }))

const user: User = {
  id: 'user-1',
  firstName: 'Alice',
  email: 'alice@example.com',
}

function renderProgressSync(
  currentUser: User | null | undefined,
  strictMode = false
) {
  const client = new QueryClient()
  client.setQueryDefaults(userKeys.me(), { enabled: false })
  client.setQueryData(userKeys.me(), currentUser)
  const onRecover = vi.fn()

  const view = renderHook(
    () => useFlashcardProgressSync({ deckId: 'deck-1', onRecover }),
    {
      reactStrictMode: strictMode,
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    }
  )

  return { ...view, client, onRecover }
}

describe('useFlashcardProgressSync', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(submitProgressAction).mockReset()
  })

  afterEach(() => vi.restoreAllMocks())

  it('submits a 101-card session as individually idempotent attempts', async () => {
    vi.mocked(submitProgressAction).mockResolvedValue({
      success: true,
      data: [],
    })
    const results = Array.from({ length: 101 }, (_, index) => ({
      flashcardId: `card-${index + 1}`,
      isCorrect: index % 2 === 0,
    }))
    const { result } = renderProgressSync(user)

    act(() => result.current.complete(results))

    await waitFor(() => {
      expect(result.current.status).toBe(FlashcardProgressStatus.SAVED)
    })

    expect(submitProgressAction).toHaveBeenCalledTimes(101)
    expect(
      vi
        .mocked(submitProgressAction)
        .mock.calls.every(
          ([payload]) =>
            payload.results.length === 1 &&
            typeof payload.attemptId === 'string' &&
            payload.attemptId.startsWith('flashcards:')
        )
    ).toBe(true)
  })

  it('keeps a failed answer durable and retries it with the same attempt id', async () => {
    vi.mocked(submitProgressAction)
      .mockResolvedValueOnce({ success: false, error: 'Offline' })
      .mockResolvedValueOnce({ success: false, error: 'Offline' })
      .mockResolvedValueOnce({ success: false, error: 'Offline' })
      .mockResolvedValueOnce({ success: true, data: [] })
    const { result } = renderProgressSync(user)

    act(() => {
      result.current.complete([{ flashcardId: 'card-1', isCorrect: true }])
    })

    await waitFor(() => {
      expect(result.current.status).toBe(FlashcardProgressStatus.ERROR)
    })
    const firstAttemptId =
      vi.mocked(submitProgressAction).mock.calls[0]?.[0].attemptId

    await act(async () => {
      await result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.status).toBe(FlashcardProgressStatus.SAVED)
    })
    expect(
      vi
        .mocked(submitProgressAction)
        .mock.calls.slice(1)
        .every(([payload]) => payload.attemptId === firstAttemptId)
    ).toBe(true)
  })

  it('recovers a pending session after a refresh and retains its attempt id', async () => {
    vi.mocked(submitProgressAction)
      .mockResolvedValueOnce({ success: false, error: 'Offline' })
      .mockResolvedValueOnce({ success: false, error: 'Offline' })
      .mockResolvedValueOnce({ success: false, error: 'Offline' })
      .mockResolvedValueOnce({ success: true, data: [] })
    const firstView = renderProgressSync(user)

    act(() => {
      firstView.result.current.complete([
        { flashcardId: 'card-1', isCorrect: false },
      ])
    })

    await waitFor(() => {
      expect(firstView.result.current.status).toBe(
        FlashcardProgressStatus.ERROR
      )
    })
    const attemptIdBeforeRefresh =
      vi.mocked(submitProgressAction).mock.calls[0]?.[0].attemptId
    firstView.unmount()

    const secondView = renderProgressSync(user)

    await waitFor(() => {
      expect(secondView.result.current.status).toBe(
        FlashcardProgressStatus.SAVED
      )
    })

    expect(secondView.onRecover).toHaveBeenCalledWith([
      { flashcardId: 'card-1', isCorrect: false },
    ])
    expect(vi.mocked(submitProgressAction).mock.calls[3]?.[0].attemptId).toBe(
      attemptIdBeforeRefresh
    )
  })

  it('recovers a pending session during Strict Mode effect replay', async () => {
    localStorage.setItem(
      'vocab-flashcards-progress:v1:user-1:deck-1',
      JSON.stringify([
        {
          version: 1,
          sessionId: 'session-1',
          results: [{ flashcardId: 'card-1', isCorrect: true }],
          pending: [
            {
              attemptId: 'flashcards:session-1:0',
              flashcardId: 'card-1',
              isCorrect: true,
            },
          ],
        },
      ])
    )
    vi.mocked(submitProgressAction).mockResolvedValue({
      success: true,
      data: [],
    })

    const view = renderProgressSync(user, true)

    await waitFor(() => {
      expect(view.onRecover).toHaveBeenCalledWith([
        { flashcardId: 'card-1', isCorrect: true },
      ])
    })
    await waitFor(() => {
      expect(view.result.current.status).toBe(FlashcardProgressStatus.SAVED)
    })
    expect(submitProgressAction).toHaveBeenCalledOnce()
  })

  it('stops before the next answer when the authenticated account changes during sync', async () => {
    let resolveFirst: ((value: { success: true; data: [] }) => void) | null =
      null
    vi.mocked(submitProgressAction)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      )
      .mockResolvedValue({ success: true, data: [] })
    const { client, result } = renderProgressSync(user)

    act(() => {
      result.current.complete([
        { flashcardId: 'card-1', isCorrect: true },
        { flashcardId: 'card-2', isCorrect: false },
      ])
    })

    await waitFor(() => {
      expect(submitProgressAction).toHaveBeenCalledTimes(1)
    })
    act(() => {
      client.setQueryData(userKeys.me(), null)
    })
    await act(async () => {
      resolveFirst?.({ success: true, data: [] })
    })

    await waitFor(() => {
      expect(result.current.status).toBe(FlashcardProgressStatus.ERROR)
    })
    expect(submitProgressAction).toHaveBeenCalledTimes(1)
  })

  it.each([false, true])(
    'should_submit_once_when_pending_identity_resolves_with_strict_mode_%s',
    async (strictMode) => {
      vi.mocked(submitProgressAction).mockResolvedValue({
        success: true,
        data: [],
      })
      const { client, result } = renderProgressSync(undefined, strictMode)

      act(() => {
        result.current.complete([{ flashcardId: 'card-1', isCorrect: true }])
      })

      expect(result.current.status).toBe(
        FlashcardProgressStatus.WAITING_FOR_IDENTITY
      )
      expect(submitProgressAction).not.toHaveBeenCalled()
      expect(localStorage.length).toBe(0)

      act(() => {
        client.setQueryData(userKeys.me(), user)
      })

      await waitFor(() => {
        expect(result.current.status).toBe(FlashcardProgressStatus.SAVED)
      })
      expect(submitProgressAction).toHaveBeenCalledOnce()
      expect(localStorage.length).toBe(0)
    }
  )

  it('should_discard_waiting_results_when_identity_resolves_to_guest', async () => {
    const { client, result } = renderProgressSync(undefined, true)

    act(() => {
      result.current.complete([{ flashcardId: 'card-1', isCorrect: true }])
    })
    act(() => {
      client.setQueryData(userKeys.me(), null)
    })

    await waitFor(() => {
      expect(result.current.status).toBe(FlashcardProgressStatus.GUEST)
    })
    act(() => {
      client.setQueryData(userKeys.me(), user)
    })
    await waitFor(() => {
      expect(client.getQueryData(userKeys.me())).toEqual(user)
    })
    expect(submitProgressAction).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
  })

  it('should_not_duplicate_submission_when_retry_runs_during_an_active_request', async () => {
    let resolveSubmit:
      ((value: { success: true; data: [] }) => void) | undefined
    vi.mocked(submitProgressAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve
        })
    )
    const { result } = renderProgressSync(user, true)

    act(() => {
      result.current.complete([{ flashcardId: 'card-1', isCorrect: true }])
    })
    await waitFor(() => expect(submitProgressAction).toHaveBeenCalledOnce())
    await act(async () => {
      await result.current.retry()
    })
    expect(submitProgressAction).toHaveBeenCalledOnce()

    await act(async () => {
      resolveSubmit?.({ success: true, data: [] })
    })
    await waitFor(() =>
      expect(result.current.status).toBe(FlashcardProgressStatus.SAVED)
    )
  })

  it('should_stop_sending_remaining_answers_when_session_unmounts', async () => {
    let resolveSubmit:
      ((value: { success: true; data: [] }) => void) | undefined
    vi.mocked(submitProgressAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve
        })
    )
    const view = renderProgressSync(user)
    act(() => {
      view.result.current.complete([
        { flashcardId: 'card-1', isCorrect: true },
        { flashcardId: 'card-2', isCorrect: false },
      ])
    })
    await waitFor(() => expect(submitProgressAction).toHaveBeenCalledOnce())
    view.unmount()
    await act(async () => {
      resolveSubmit?.({ success: true, data: [] })
    })

    expect(submitProgressAction).toHaveBeenCalledOnce()
    expect(localStorage.length).toBe(1)
  })

  it('does not persist or submit a guest session', () => {
    const { result } = renderProgressSync(null)

    act(() => {
      result.current.complete([{ flashcardId: 'card-1', isCorrect: true }])
    })

    expect(result.current.status).toBe(FlashcardProgressStatus.GUEST)
    expect(submitProgressAction).not.toHaveBeenCalled()
    expect(localStorage.length).toBe(0)
  })
})
