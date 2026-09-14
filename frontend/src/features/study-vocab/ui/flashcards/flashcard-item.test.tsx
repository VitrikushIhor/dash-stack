import { createElement } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type StudyCard, VocabProgressStatus } from '@/entities/vocab'
import { FlashcardItem } from './flashcard-item'

vi.mock('next/image', () => ({
  default: ({ alt, onError }: { alt: string; onError?: () => void }) =>
    createElement('img', { alt, onError: () => onError?.() }),
}))

const card: StudyCard = {
  id: 'card-1',
  deckId: 'deck-1',
  term: 'apple',
  definition: 'A fruit',
  example: null,
  imageUrl: 'https://images.example.test/apple.jpg',
  position: 0,
  progress: {
    id: null,
    status: VocabProgressStatus.NEW,
    box: 1,
    isStarred: false,
    correctStreak: 0,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
  },
}

describe('FlashcardItem', () => {
  it('should_show_loading_and_block_star_clicks_while_saving', () => {
    const onToggleStar = vi.fn()
    render(
      <FlashcardItem
        card={card}
        isFlipped={false}
        isStarred={false}
        isStarPending
        onFlip={vi.fn()}
        onReplay={vi.fn()}
        onToggleStar={onToggleStar}
      />
    )
    const button = screen.getAllByRole('button', { name: 'Star card' })[0]
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByLabelText('Saving star').length).toBeGreaterThan(0)
    fireEvent.click(button)
    expect(onToggleStar).not.toHaveBeenCalled()
  })
  it('hides a broken image without removing the card content', async () => {
    render(
      <FlashcardItem
        card={card}
        isFlipped
        isStarred={false}
        onFlip={vi.fn()}
        onReplay={vi.fn()}
        onToggleStar={vi.fn()}
      />
    )

    const image = screen.getByAltText('Illustration for apple')
    fireEvent.error(image)

    await waitFor(() =>
      expect(
        screen.queryByAltText('Illustration for apple')
      ).not.toBeInTheDocument()
    )
    expect(screen.getByText('A fruit')).toBeInTheDocument()
  })

  it('keeps the pronunciation and star controls separate from flipping', () => {
    const onFlip = vi.fn()
    const onReplay = vi.fn()
    const onToggleStar = vi.fn()
    render(
      <FlashcardItem
        card={card}
        isFlipped={false}
        isStarred={false}
        onFlip={onFlip}
        onReplay={onReplay}
        onToggleStar={onToggleStar}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pronounce term' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Star card' })[0])

    expect(onReplay).toHaveBeenCalledOnce()
    expect(onToggleStar).toHaveBeenCalledOnce()
    expect(onFlip).not.toHaveBeenCalled()
  })
})
