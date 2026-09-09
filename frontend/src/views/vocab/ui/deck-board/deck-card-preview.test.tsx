import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type StudyCard } from '@/entities/vocab'
import { DeckCardPreview } from './deck-card-preview'

const card: StudyCard = {
  id: 'card-1',
  deckId: 'deck-1',
  term: 'deploy',
  definition: 'release an application',
  example: 'We deploy every day.',
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
}

describe('DeckCardPreview', () => {
  it('should_render_both_faces_for_an_animated_flip', async () => {
    const onFlip = vi.fn()
    const { rerender } = render(
      <DeckCardPreview
        card={card}
        cardCount={1}
        currentIndex={0}
        isAuthenticated={false}
        isFlipped={false}
        onFlip={onFlip}
        onMove={vi.fn()}
        onPronounce={vi.fn()}
        onToggleStar={vi.fn()}
      />
    )

    expect(screen.getByTestId('preview-card-inner')).toHaveClass('transform-3d')
    expect(
      screen.getByText(card.term).closest('[aria-hidden]')
    ).toHaveAttribute('aria-hidden', 'false')
    expect(
      screen.getByText(card.definition).closest('[aria-hidden]')
    ).toHaveAttribute('aria-hidden', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'Preview card' }))
    expect(onFlip).toHaveBeenCalledOnce()

    rerender(
      <DeckCardPreview
        card={card}
        cardCount={1}
        currentIndex={0}
        isAuthenticated={false}
        isFlipped
        onFlip={onFlip}
        onMove={vi.fn()}
        onPronounce={vi.fn()}
        onToggleStar={vi.fn()}
      />
    )

    expect(screen.getByTestId('preview-card-inner')).toHaveClass(
      'transform-[rotateY(180deg)]'
    )
    expect(
      screen.getByText(card.definition).closest('[aria-hidden]')
    ).toHaveAttribute('aria-hidden', 'false')
  })
})
