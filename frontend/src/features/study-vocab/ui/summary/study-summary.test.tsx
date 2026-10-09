import { type ComponentProps } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config/constants/routes'
import { StudyMode } from '@/entities/vocab'
import { FlashcardProgressStatus } from '../../model/flashcards/session/use-flashcard-progress-sync'
import { StudySummary } from './study-summary'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('./guest-study-save-progress-cta', () => ({
  GuestStudySaveProgressCta: () => null,
}))

describe('StudySummary', () => {
  it('should_require_one_mode_discriminant_when_accepting_summary_props', () => {
    type Props = ComponentProps<typeof StudySummary>
    type MatchProps = Extract<Props, { kind: typeof StudyMode.MATCH }>

    expectTypeOf<Props>().toMatchTypeOf<{
      kind: typeof StudyMode.MATCH | typeof StudyMode.FLASHCARDS
    }>()
    expectTypeOf<
      'isMatchGame' extends keyof Props ? true : false
    >().toEqualTypeOf<false>()
    expectTypeOf<
      'progressStatus' extends keyof MatchProps ? true : false
    >().toEqualTypeOf<false>()
  })

  it('should_show_duration_and_restart_when_match_completes', () => {
    const restart = vi.fn()
    render(
      <StudySummary
        kind={StudyMode.MATCH}
        matchDurationMs={65400}
        onRestart={restart}
      />
    )
    expect(screen.getByText('1:05.4s')).toBeInTheDocument()
    expect(screen.queryByText('Accuracy')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Practice Missed' })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))
    expect(restart).toHaveBeenCalledOnce()
  })

  it('should_show_accuracy_and_retry_missed_when_flashcards_include_incorrect_answers', () => {
    const retry = vi.fn()
    render(
      <StudySummary
        kind={StudyMode.FLASHCARDS}
        results={[
          { flashcardId: '1', isCorrect: true },
          { flashcardId: '2', isCorrect: false },
        ]}
        onRetryIncorrect={retry}
      />
    )
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Practice Missed' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('should_hide_retry_missed_when_all_answers_are_correct', () => {
    render(
      <StudySummary
        kind={StudyMode.FLASHCARDS}
        results={[{ flashcardId: '1', isCorrect: true }]}
        onRetryIncorrect={vi.fn()}
      />
    )
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Practice Missed' })
    ).not.toBeInTheDocument()
  })

  it('should_disable_session_actions_when_submitting', () => {
    render(
      <StudySummary
        kind={StudyMode.FLASHCARDS}
        results={[{ flashcardId: '1', isCorrect: false }]}
        onRestart={vi.fn()}
        onRetryIncorrect={vi.fn()}
        isSubmitting
      />
    )
    expect(
      screen.getByRole('button', { name: 'Practice Missed' })
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()
  })

  it('should_navigate_to_decks_when_back_action_is_clicked', () => {
    render(<StudySummary kind={StudyMode.MATCH} matchDurationMs={1000} />)
    fireEvent.click(screen.getByRole('button', { name: 'Back to Decks' }))
    expect(push).toHaveBeenCalledWith(ROUTES.vocabDecks)
  })

  it.each([
    [FlashcardProgressStatus.SAVING, 'Saving each answer securely…'],
    [
      FlashcardProgressStatus.WAITING_FOR_IDENTITY,
      'Checking whether this progress can be saved…',
    ],
  ])('should_show_sync_message_when_status_is_%s', (status, message) => {
    render(
      <StudySummary
        kind={StudyMode.FLASHCARDS}
        results={[]}
        progressStatus={status}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent(message)
  })

  it('explains that progress remains durable and exposes an explicit retry after sync failure', () => {
    const retry = vi.fn()

    render(
      <StudySummary
        kind={StudyMode.FLASHCARDS}
        results={[{ flashcardId: 'card-1', isCorrect: true }]}
        progressStatus={FlashcardProgressStatus.ERROR}
        progressError='Offline'
        onRetryProgress={retry}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your answers are saved on this device'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
