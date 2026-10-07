import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDeckQuery } from '@/entities/deck/server'
import { userKeys } from '@/entities/user'
import { getCurrentUser } from '@/entities/user/server'
import { type StudyCard, StudyMode } from '@/entities/vocab'
import { getStudyCardsQuery } from '@/entities/vocab/server'
import { VocabFlashcards } from '@/widgets/vocab-flashcards'
import { getStudyRouteData } from '@/views/vocab/server'
import StudyModePage, {
  generateMetadata,
} from '@/app/(vocab)/vocab/decks/[id]/[mode]/page'

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/vocab/decks/deck/flashcards',
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/features/study-vocab/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/study-vocab/server')>()),
  submitProgressAction: vi.fn(async () => ({ success: true, data: [] })),
}))
vi.mock('@/entities/deck/server', () => ({ getDeckQuery: vi.fn() }))
vi.mock('@/entities/user/server', () => ({ getCurrentUser: vi.fn() }))
vi.mock('@/entities/vocab/server', () => ({ getStudyCardsQuery: vi.fn() }))

function withQueryClient(children: ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.mocked(getDeckQuery).mockResolvedValue({
    ok: true,
    data: {
      id: 'deck',
      ownerUserId: 'owner',
      title: 'Vocabulary',
      language: 'en',
      tags: [],
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      type: 'USER_GENERATED',
      createdAt: '',
      updatedAt: '',
    },
  })
  vi.mocked(getStudyCardsQuery).mockResolvedValue({ ok: true, data: [] })
  vi.mocked(getCurrentUser).mockResolvedValue({
    data: {
      id: 'learner',
      firstName: 'Learner',
      email: 'learner@example.test',
    },
    error: null,
    statusCode: null,
  })
})

describe('study route composition', () => {
  it.each(['flashcards', 'learn', 'match'] as const)(
    'should_preserve_metadata_when_mode_is_%s',
    async (mode) => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ id: 'deck', mode }),
        searchParams: Promise.resolve({}),
      })
      expect(metadata.title).toBe(
        { flashcards: 'Flashcards', learn: 'Learn Mode', match: 'Match Game' }[
          mode
        ]
      )
    }
  )

  it('should_return_not_found_when_mode_is_unknown', async () => {
    vi.mocked(getDeckQuery).mockClear()
    const props = {
      params: Promise.resolve({ id: 'deck', mode: 'unknown' }),
      searchParams: Promise.resolve({}),
    }
    await expect(StudyModePage(props)).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404'
    )
    await expect(generateMetadata(props)).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404'
    )
    expect(getDeckQuery).not.toHaveBeenCalled()
  })
  it.each([StudyMode.FLASHCARDS, StudyMode.LEARN, StudyMode.MATCH] as const)(
    'should_load_personalized_filters_when_mode_is_%s',
    async (mode) => {
      await getStudyRouteData({
        mode,
        params: Promise.resolve({ id: 'deck' }),
        searchParams: Promise.resolve({ onlyDue: 'true', onlyStarred: 'true' }),
      })

      expect(getStudyCardsQuery).toHaveBeenCalledWith({
        deckId: 'deck',
        mode,
        onlyDue: true,
        onlyStarred: true,
      })
    }
  )

  it('should_not_render_a_study_header_for_empty_selection', async () => {
    vi.mocked(getCurrentUser).mockClear()
    render(
      withQueryClient(
        <NuqsTestingAdapter>
          {await StudyModePage({
            params: Promise.resolve({ id: 'deck', mode: 'flashcards' }),
            searchParams: Promise.resolve({}),
          })}
        </NuqsTestingAdapter>
      )
    )

    expect(
      await screen.findByRole('heading', {
        name: 'No cards match these filters',
      })
    ).toBeVisible()

    expect(
      screen.queryByRole('navigation', { name: 'Study modes' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Starred only' })
    ).not.toBeInTheDocument()
    expect(getCurrentUser).not.toHaveBeenCalled()
  })

  it('should_render_filtered_empty_state_in_match_before_minimum_card_state', async () => {
    render(
      withQueryClient(
        <NuqsTestingAdapter>
          {await StudyModePage({
            params: Promise.resolve({ id: 'deck', mode: 'match' }),
            searchParams: Promise.resolve({ onlyStarred: 'true' }),
          })}
        </NuqsTestingAdapter>
      )
    )

    expect(
      screen.getByRole('heading', { name: 'No cards match these filters' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Not enough cards for Match' })
    ).not.toBeInTheDocument()
  })

  it.each([1, 5])(
    'should_render_match_minimum_state_when_selection_has_%s_cards',
    async (count) => {
      const cards: StudyCard[] = Array.from(
        { length: count },
        (_, position) => ({
          id: `card-${position}`,
          deckId: 'deck',
          term: `Term ${position}`,
          definition: `Meaning ${position}`,
          example: null,
          imageUrl: null,
          position,
          progress: {
            id: null,
            status: 'NEW',
            box: 0,
            isStarred: false,
            correctStreak: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
          },
        })
      )
      vi.mocked(getStudyCardsQuery).mockResolvedValue({ ok: true, data: cards })

      render(
        await StudyModePage({
          params: Promise.resolve({ id: 'deck', mode: 'match' }),
          searchParams: Promise.resolve({}),
        })
      )

      expect(
        screen.getByRole('heading', { name: 'Not enough cards for Match' })
      ).toBeVisible()
      expect(
        screen.queryByRole('heading', { name: 'No cards match these filters' })
      ).not.toBeInTheDocument()
    }
  )

  it('should_keep_completion_summary_when_cards_are_removed_after_review', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })

    client.setQueryData(userKeys.me(), {
      id: 'learner',
      firstName: 'Learner',
      email: 'learner@example.test',
    })
    const deck = {
      id: 'deck',
      ownerUserId: 'owner',
      title: 'Vocabulary',
      language: 'en',
      tags: [],
      visibility: 'PUBLIC' as const,
      status: 'PUBLISHED' as const,
      type: 'USER_GENERATED' as const,
      createdAt: '',
      updatedAt: '',
    }
    const cards = [
      {
        id: 'card',
        deckId: 'deck',
        term: 'Term',
        definition: 'Meaning',
        example: null,
        imageUrl: null,
        position: 0,
        progress: {
          id: 'progress',
          status: 'LEARNING' as const,
          box: 1,
          isStarred: false,
          correctStreak: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewedAt: null,
          nextReviewAt: '2026-01-01T00:00:00.000Z',
        },
      },
    ]
    const wrap = (children: ReactNode) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const view = render(
      wrap(<VocabFlashcards deck={deck} initialCards={cards} />)
    )

    await userEvent.click(screen.getByRole('button', { name: 'Flashcard' }))
    await userEvent.click(screen.getByRole('button', { name: 'Know (2)' }))
    expect(
      await screen.findByRole('heading', { name: 'Session Complete!' })
    ).toBeInTheDocument()

    view.rerender(wrap(<VocabFlashcards deck={deck} initialCards={[]} />))
    expect(
      screen.getByRole('heading', { name: 'Session Complete!' })
    ).toBeInTheDocument()
  })
})
