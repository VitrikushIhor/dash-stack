import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type User, userApi, userKeys } from '@/entities/user'
import { useSubmitProgress } from './use-submit-progress'

const executeMock = vi.fn()
const mockUser: User = {
  id: 'user-1',
  firstName: 'Alice',
  email: 'alice@example.com',
}

vi.mock('@/shared/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib')>()
  return {
    ...actual,
    useAction: () => ({ execute: executeMock, isPending: false }),
  }
})
vi.mock('../../server', () => ({ submitProgressAction: vi.fn() }))

afterEach(() => vi.restoreAllMocks())

describe('useSubmitProgress', () => {
  beforeEach(() => vi.clearAllMocks())

  function renderSubmission(user: User | null | undefined) {
    const client = new QueryClient()
    if (user !== undefined) client.setQueryData(userKeys.me(), user)
    return renderHook(() => useSubmitProgress(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    })
  }

  it('does not submit study progress or request authentication for a confirmed guest', async () => {
    const getMe = vi.spyOn(userApi, 'getMe')
    const { result } = renderSubmission(null)
    await act(async () => {
      await result.current.submitProgress('deck-1', [
        { flashcardId: 'card-1', isCorrect: true },
      ])
      await result.current.submitProgress('deck-1', [
        { flashcardId: 'card-1', isCorrect: true },
      ])
    })
    expect(executeMock).not.toHaveBeenCalled()
    expect(getMe).not.toHaveBeenCalled()
  })

  it('submits study progress immediately using the cached user', async () => {
    const getMe = vi.spyOn(userApi, 'getMe')
    const { result } = renderSubmission(mockUser)
    await act(async () => {
      const submission = result.current.submitProgress('deck-1', [
        { flashcardId: 'card-1', isCorrect: true },
      ])
      expect(executeMock).toHaveBeenCalledWith({
        deckId: 'deck-1',
        results: [{ flashcardId: 'card-1', isCorrect: true }],
      })
      await submission
    })
    expect(getMe).not.toHaveBeenCalled()
  })

  it('delegates authentication to the action without waiting for an in-flight user query', async () => {
    const getMe = vi
      .spyOn(userApi, 'getMe')
      .mockReturnValue(new Promise<User>(() => {}))
    const { result } = renderSubmission(undefined)
    await act(async () => {
      const submission = result.current.submitProgress('deck-1', [
        { flashcardId: 'card-1', isCorrect: true },
      ])
      expect(executeMock).toHaveBeenCalledWith({
        deckId: 'deck-1',
        results: [{ flashcardId: 'card-1', isCorrect: true }],
      })
      await submission
    })
    expect(getMe).toHaveBeenCalledTimes(1)
  })
})
