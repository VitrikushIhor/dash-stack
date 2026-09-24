import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FlashcardProgressStatus } from '../../model/flashcards/session/use-flashcard-progress-sync'
import { StudySummary } from './study-summary'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('./guest-study-save-progress-cta', () => ({
  GuestStudySaveProgressCta: () => null,
}))

describe('StudySummary', () => {
  it('explains that progress remains durable and exposes an explicit retry after sync failure', () => {
    const retry = vi.fn()

    render(
      <StudySummary
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
