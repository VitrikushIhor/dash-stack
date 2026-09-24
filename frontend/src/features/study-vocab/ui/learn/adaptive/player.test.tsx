import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userKeys } from '@/entities/user'
import { type StudyCard } from '@/entities/vocab'
import { submitProgressAction } from '../../../server'
import { AdaptiveLearnPlayer } from './player'

vi.mock('../../../server', () => ({ submitProgressAction: vi.fn() }))

const speak = vi.fn()

vi.mock('@/shared/lib/hooks/use-speech', () => ({
  useSpeech: () => ({ speak, stop: vi.fn(), isSupported: true }),
}))

const learnCards: StudyCard[] = ['apple', 'boat', 'cat', 'door'].map(
  (term, position) => ({
    id: `card-${position}`,
    deckId: 'deck',
    term,
    definition: `Meaning of ${term}`,
    example: null,
    imageUrl: null,
    position,
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
  })
)

function wrapper(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })

  client.setQueryData(userKeys.me(), { id: 'user', email: 'user@example.test' })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.mocked(submitProgressAction).mockResolvedValue({ success: true, data: [] })
})

describe('AdaptiveLearnPlayer', () => {
  it('should_start_a_new_session_without_an_intermediate_start_screen', async () => {
    render(wrapper(<AdaptiveLearnPlayer deckId='deck' cards={learnCards} />))

    expect(
      await screen.findByText('Multiple choice · streak 0 / 2')
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Start adaptive session' })
    ).not.toBeInTheDocument()
  })

  it('should_start_in_mcq_and_show_four_unique_definition_choices', async () => {
    render(wrapper(<AdaptiveLearnPlayer deckId='deck' cards={learnCards} />))

    expect(
      await screen.findByText('Multiple choice · streak 0 / 2')
    ).toBeInTheDocument()
    const choices = screen
      .getAllByRole('button')
      .filter((button) => /^[1-4]/.test(button.textContent ?? ''))

    expect(choices).toHaveLength(4)
    expect(new Set(choices.map((button) => button.textContent)).size).toBe(4)
  })

  it('should_show_answer_feedback_on_choices_and_advance_session_progress', async () => {
    render(wrapper(<AdaptiveLearnPlayer deckId='deck' cards={learnCards} />))

    await userEvent.click(
      await screen.findByRole('button', {
        name: new RegExp(learnCards[0].definition),
      })
    )

    expect(await screen.findByRole('status')).toHaveClass('text-emerald-700')
    expect(
      screen.getByRole('button', { name: new RegExp(learnCards[0].definition) })
    ).toHaveClass('border-emerald-500')
    expect(
      screen.getByText('Mastery progress: 1 / 8 steps')
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '12.5'
    )
  })

  it('should_mark_the_wrong_choice_red_and_reveal_the_correct_choice_green', async () => {
    render(wrapper(<AdaptiveLearnPlayer deckId='deck' cards={learnCards} />))

    const correctChoice = await screen.findByRole('button', {
      name: new RegExp(learnCards[0].definition),
    })
    const wrongChoice = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button !== correctChoice && /^[1-4]/.test(button.textContent ?? '')
      )

    if (!wrongChoice) throw new Error('Expected an incorrect choice')
    await userEvent.click(wrongChoice)

    expect(await screen.findByRole('alert')).toHaveClass('text-red-700')
    expect(wrongChoice).toHaveClass('border-red-500')
    expect(correctChoice).toHaveClass('border-emerald-500')
  })

  it('should_show_exact_feedback_play_tts_and_continue_after_save', async () => {
    render(
      wrapper(
        <AdaptiveLearnPlayer deckId='deck' cards={learnCards.slice(0, 1)} />
      )
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Type the term' }),
      'apple'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Check' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Correct!')
    await waitFor(() =>
      expect(speak).toHaveBeenCalledWith(
        'apple',
        expect.objectContaining({ eventKey: expect.any(String) })
      )
    )
    expect(submitProgressAction).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('should_restore_the_submitted_typing_answer_with_saved_feedback', async () => {
    const storageKey = 'vocab-learn:user:deck'
    const initial = learnCards[0]

    const initialView = render(
      wrapper(
        <AdaptiveLearnPlayer deckId='deck' cards={learnCards.slice(0, 1)} />
      )
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Type the term' }),
      initial.term
    )
    await userEvent.click(screen.getByRole('button', { name: 'Check' }))
    await screen.findByText('Correct!')

    const savedSnapshot = localStorage.getItem(storageKey)
    expect(savedSnapshot).not.toBeNull()
    initialView.unmount()

    const view = render(
      wrapper(
        <AdaptiveLearnPlayer deckId='deck' cards={learnCards.slice(0, 1)} />
      )
    )

    expect(
      await view.findByRole('textbox', { name: 'Type the term' })
    ).toHaveValue(initial.term)
  })

  it('should_surface_progress_failure_and_retry_the_same_attempt', async () => {
    vi.mocked(submitProgressAction)
      .mockResolvedValueOnce({ success: false, error: 'Connection lost' })
      .mockResolvedValueOnce({ success: true, data: [] })
    render(
      wrapper(
        <AdaptiveLearnPlayer deckId='deck' cards={learnCards.slice(0, 1)} />
      )
    )
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Type the term' }),
      'apple'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Check' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Connection lost'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    )
    expect(vi.mocked(submitProgressAction).mock.calls[0][0].attemptId).toBe(
      vi.mocked(submitProgressAction).mock.calls[1][0].attemptId
    )
  })

  it('should_keep_feedback_visible_and_complete_after_the_card_becomes_mastered', async () => {
    render(
      wrapper(
        <AdaptiveLearnPlayer deckId='deck' cards={learnCards.slice(0, 1)} />
      )
    )

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Type the term' }),
        'apple'
      )
      await userEvent.click(screen.getByRole('button', { name: 'Check' }))
      expect(await screen.findByRole('status')).toHaveTextContent('Correct!')
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    }

    expect(
      screen.getByRole('heading', { name: 'Session Complete!' })
    ).toBeInTheDocument()
  })

  it('should_mark_a_close_mcq_distractor_as_incorrect', async () => {
    const closeChoices = learnCards.map((card, index) => ({
      ...card,
      definition: ['cat', 'cats', 'dog', 'bird'][index],
    }))

    render(<AdaptiveLearnPlayer deckId='deck' cards={closeChoices} />, {
      wrapper: ({ children }) => wrapper(children),
    })
    await userEvent.click(await screen.findByRole('button', { name: /cats/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect')
    expect(submitProgressAction).toHaveBeenCalledWith(
      expect.objectContaining({
        results: [{ flashcardId: 'card-0', isCorrect: false }],
      })
    )
  })

  it('should_complete_the_full_adaptive_flow_and_retry_the_last_attempt', async () => {
    let submissionCount = 0

    vi.mocked(submitProgressAction).mockImplementation(async () => {
      submissionCount += 1

      return submissionCount === 8
        ? { success: false, error: 'Connection lost' }
        : { success: true, data: [] }
    })
    const user = userEvent.setup()

    render(wrapper(<AdaptiveLearnPlayer deckId='deck' cards={learnCards} />))

    for (const [index, card] of learnCards.entries()) {
      await user.click(
        await screen.findByRole('button', {
          name: new RegExp(`${card.definition}$`),
        })
      )
      expect(await screen.findByRole('status')).toHaveTextContent('Correct!')
      await user.click(screen.getByRole('button', { name: 'Continue' }))
      expect(
        screen.getByRole('textbox', { name: 'Type the term' })
      ).toBeInTheDocument()
      await user.type(
        screen.getByRole('textbox', { name: 'Type the term' }),
        card.term
      )
      await user.click(screen.getByRole('button', { name: 'Check' }))
      expect(await screen.findByRole('status')).toHaveTextContent('Correct!')

      const isLastAttempt = index === learnCards.length - 1

      if (isLastAttempt) {
        expect(await screen.findByRole('alert')).toHaveTextContent(
          'Connection lost'
        )
        const failedAttempt = vi.mocked(submitProgressAction).mock.calls[7][0]

        await user.click(screen.getByRole('button', { name: 'Retry' }))
        await waitFor(() =>
          expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        )
        expect(vi.mocked(submitProgressAction).mock.calls[8][0].attemptId).toBe(
          failedAttempt.attemptId
        )
      }

      await user.click(screen.getByRole('button', { name: 'Continue' }))
    }

    expect(
      screen.getByRole('heading', { name: 'Session Complete!' })
    ).toBeInTheDocument()
    expect(submitProgressAction).toHaveBeenCalledTimes(9)
  })
})
