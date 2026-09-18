import { type ReactNode, StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userKeys } from '@/entities/user'
import { type StudyCard } from '@/entities/vocab'
import { submitProgressAction } from '../../../server'
import { answerAdaptiveLearnQuestion } from '../answer/adaptive-answer'
import { LearnAnswerKind } from './adaptive-session.constants'
import {
  createLearnSnapshot,
  saveLearnSnapshot,
} from './adaptive-session.storage'
import { useAdaptiveLearn } from './use-adaptive-session'

vi.mock('../../../server', () => ({ submitProgressAction: vi.fn() }))

const cards: StudyCard[] = [
  {
    id: 'card',
    deckId: 'deck',
    term: 'apple',
    definition: 'A fruit',
    example: null,
    imageUrl: null,
    position: 0,
    progress: {
      id: null,
      status: 'NEW',
      box: 1,
      isStarred: false,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
    },
  },
]

function wrapper(guest = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })

  client.setQueryData(
    userKeys.me(),
    guest ? null : { id: 'user', email: 'user@example.test' }
  )

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

function wrapperWithClient(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.mocked(submitProgressAction).mockResolvedValue({ success: true, data: [] })
})

describe('useAdaptiveLearn', () => {
  it('should_submit_each_attempt_once_and_never_submit_a_summary_when_completing', async () => {
    const { result } = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(() => result.current.start())
    await act(async () => {
      await Promise.all([
        result.current.answer({ kind: 'typing', value: 'apple' }),
        result.current.answer({ kind: 'typing', value: 'apple' }),
      ])
    })
    expect(submitProgressAction).toHaveBeenCalledTimes(1)
    await act(() => result.current.next())
    await act(() => result.current.answer({ kind: 'typing', value: 'APPLE' }))
    await act(() => result.current.next())

    expect(result.current.snapshot?.session.phase).toBe('complete')
    expect(submitProgressAction).toHaveBeenCalledTimes(2)
    const [first, second] = vi.mocked(submitProgressAction).mock.calls

    expect(first[0].attemptId).not.toBe(second[0].attemptId)
  })

  it('should_retry_the_same_id_after_remount_when_server_response_was_lost', async () => {
    vi.mocked(submitProgressAction).mockResolvedValueOnce({
      success: false,
      error: 'Connection lost',
    })
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))
    await act(() => view.result.current.start())
    await act(() =>
      view.result.current.answer({ kind: 'typing', value: 'apple' })
    )
    expect(view.result.current.error).toContain('Connection lost')
    const firstId = vi.mocked(submitProgressAction).mock.calls[0][0].attemptId

    view.unmount()

    const resumed = renderHook(() => useAdaptiveLearn('deck', []), {
      wrapper: wrapper(),
    })

    await waitFor(() =>
      expect(resumed.result.current.snapshot?.feedback?.sync).toBe('saved')
    )
    expect(vi.mocked(submitProgressAction).mock.calls[1][0].attemptId).toBe(
      firstId
    )
    expect(resumed.result.current.snapshot?.session.cards[0].mastery).toEqual({
      stage: 'typing',
      streak: 1,
    })
  })

  it('should_preserve_local_session_without_progress_writes_when_guest_answers', async () => {
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(true),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))
    await act(() => view.result.current.start())
    await act(() =>
      view.result.current.answer({ kind: 'typing', value: 'apple' })
    )
    expect(view.result.current.snapshot?.feedback?.sync).toBe('guest')
    expect(submitProgressAction).not.toHaveBeenCalled()
  })

  it('should_not_submit_or_lose_the_question_when_local_storage_write_fails', async () => {
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))
    await act(() => view.result.current.start())
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage full')
      })

    try {
      await act(() =>
        view.result.current.answer({ kind: 'typing', value: 'apple' })
      )
      expect(view.result.current.error).toContain('Storage full')
      expect(view.result.current.snapshot?.session.phase).toBe('question')
      expect(submitProgressAction).not.toHaveBeenCalled()
    } finally {
      setItem.mockRestore()
    }
  })

  it('should_surface_a_rejected_progress_request_and_stop_the_saving_state', async () => {
    vi.mocked(submitProgressAction).mockRejectedValueOnce(
      new Error('Network unavailable')
    )
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))
    await act(() => view.result.current.start())
    await act(() =>
      view.result.current.answer({ kind: 'typing', value: 'apple' })
    )

    expect(view.result.current.error).toContain('Network unavailable')
    expect(view.result.current.isSyncing).toBe(false)
    expect(view.result.current.snapshot?.feedback?.sync).toBe('pending')
  })

  it('should_not_restore_a_session_created_for_different_study_filters', async () => {
    const allCards = renderHook(
      () => useAdaptiveLearn('deck', cards, 'deck:learn:false:false'),
      { wrapper: wrapper() }
    )

    await waitFor(() => expect(allCards.result.current.isLoading).toBe(false))
    await act(() => allCards.result.current.start())
    allCards.unmount()

    const dueCards = renderHook(
      () => useAdaptiveLearn('deck', [], 'deck:learn:true:false'),
      { wrapper: wrapper() }
    )

    await waitFor(() => expect(dueCards.result.current.isLoading).toBe(false))

    expect(dueCards.result.current.snapshot).toBeNull()
  })

  it('should_coalesce_parallel_retries_for_the_same_attempt', async () => {
    vi.mocked(submitProgressAction).mockResolvedValueOnce({
      success: false,
      error: 'Connection lost',
    })
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))
    await act(() => view.result.current.start())
    await act(() =>
      view.result.current.answer({ kind: 'typing', value: 'apple' })
    )

    let resolveRetry: (result: { success: true; data: [] }) => void = () =>
      undefined

    vi.mocked(submitProgressAction).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRetry = resolve
        })
    )
    let retries: Promise<void>[] = []

    await act(async () => {
      retries = [view.result.current.retry(), view.result.current.retry()]
      await Promise.resolve()
    })

    expect(submitProgressAction).toHaveBeenCalledTimes(2)
    resolveRetry({ success: true, data: [] })
    await act(async () => Promise.all(retries))
    await act(() => view.result.current.next())

    expect(view.result.current.snapshot?.session.phase).toBe('question')
  })

  it('should_sync_the_new_identity_while_the_previous_store_is_still_syncing', async () => {
    const firstPending = answerAdaptiveLearnQuestion(
      createLearnSnapshot(cards),
      { kind: LearnAnswerKind.Typing, value: 'apple' },
      'pending'
    )
    const secondPending = answerAdaptiveLearnQuestion(
      createLearnSnapshot(cards),
      { kind: LearnAnswerKind.Typing, value: 'apple' },
      'pending'
    )

    expect(firstPending).not.toBeNull()
    expect(secondPending).not.toBeNull()
    if (!firstPending || !secondPending) return
    saveLearnSnapshot('vocab-learn:user-1:deck', firstPending)
    saveLearnSnapshot('vocab-learn:user-2:deck', secondPending)

    let resolveFirst: (result: { success: true; data: [] }) => void = () =>
      undefined

    vi.mocked(submitProgressAction)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      )
      .mockResolvedValue({ success: true, data: [] })
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    })

    client.setQueryData(userKeys.me(), {
      id: 'user-1',
      email: 'first@example.test',
    })
    renderHook(() => useAdaptiveLearn('deck', []), {
      wrapper: wrapperWithClient(client),
    })
    await waitFor(() => expect(submitProgressAction).toHaveBeenCalledTimes(1))

    act(() => {
      client.setQueryData(userKeys.me(), {
        id: 'user-2',
        email: 'second@example.test',
      })
    })
    await waitFor(() => expect(submitProgressAction).toHaveBeenCalledTimes(2))

    resolveFirst({ success: true, data: [] })
  })

  it('should_ignore_a_late_response_from_a_store_that_was_unmounted', async () => {
    let resolveOldRequest: (result: { success: true; data: [] }) => void = () =>
      undefined

    vi.mocked(submitProgressAction)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldRequest = resolve
          })
      )
      .mockResolvedValue({ success: true, data: [] })
    const first = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(first.result.current.isLoading).toBe(false))
    await act(() => first.result.current.start())
    let oldAnswer: Promise<void> = Promise.resolve()

    act(() => {
      oldAnswer = first.result.current.answer({
        kind: LearnAnswerKind.Typing,
        value: 'apple',
      })
    })
    await waitFor(() => expect(submitProgressAction).toHaveBeenCalledTimes(1))
    first.unmount()

    const resumed = renderHook(() => useAdaptiveLearn('deck', []), {
      wrapper: wrapper(),
    })

    await waitFor(() =>
      expect(resumed.result.current.snapshot?.feedback?.sync).toBe('saved')
    )
    await act(() => resumed.result.current.next())
    expect(resumed.result.current.snapshot?.session.phase).toBe('question')
    resumed.unmount()

    resolveOldRequest({ success: true, data: [] })
    await act(async () => oldAnswer)
    const reloaded = renderHook(() => useAdaptiveLearn('deck', []), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(reloaded.result.current.isLoading).toBe(false))

    expect(reloaded.result.current.snapshot?.session.phase).toBe('question')
    expect(reloaded.result.current.snapshot?.feedback).toBeNull()
  })

  it('should_keep_the_store_active_after_the_strict_mode_effect_cycle', async () => {
    const StrictWrapper = wrapper()
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: ({ children }) => (
        <StrictMode>
          <StrictWrapper>{children}</StrictWrapper>
        </StrictMode>
      ),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))

    await act(() => view.result.current.start())
    await act(() =>
      view.result.current.answer({
        kind: LearnAnswerKind.Typing,
        value: 'apple',
      })
    )

    expect(view.result.current.snapshot?.session.phase).toBe('feedback')
    expect(submitProgressAction).toHaveBeenCalledTimes(1)
  })

  it('should_not_block_a_new_identity_while_the_old_answer_is_pending', async () => {
    let resolveOldAnswer: (result: { success: true; data: [] }) => void = () =>
      undefined

    vi.mocked(submitProgressAction)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldAnswer = resolve
          })
      )
      .mockResolvedValue({ success: true, data: [] })
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    })

    client.setQueryData(userKeys.me(), {
      id: 'user-1',
      email: 'first@example.test',
    })
    const view = renderHook(() => useAdaptiveLearn('deck', cards), {
      wrapper: wrapperWithClient(client),
    })

    await waitFor(() => expect(view.result.current.isLoading).toBe(false))
    await act(() => view.result.current.start())
    let oldAnswer: Promise<void> = Promise.resolve()

    act(() => {
      oldAnswer = view.result.current.answer({
        kind: LearnAnswerKind.Typing,
        value: 'apple',
      })
    })
    await waitFor(() => expect(submitProgressAction).toHaveBeenCalledTimes(1))

    act(() => {
      client.setQueryData(userKeys.me(), {
        id: 'user-2',
        email: 'second@example.test',
      })
    })
    await waitFor(() => expect(view.result.current.snapshot).toBeNull())
    await act(() => view.result.current.start())
    await act(() =>
      view.result.current.answer({
        kind: LearnAnswerKind.Typing,
        value: 'apple',
      })
    )

    expect(submitProgressAction).toHaveBeenCalledTimes(2)
    resolveOldAnswer({ success: true, data: [] })
    await act(async () => oldAnswer)
  })
})
