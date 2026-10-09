import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SortableFlashcardList } from './sortable-flashcard-list'

const { useVirtualizerMock } = vi.hoisted(() => ({
  useVirtualizerMock: vi.fn(),
}))

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: useVirtualizerMock,
}))

vi.mock('./sortable-flashcard-item', () => ({
  SortableFlashcardItem: ({ card }: { card: { id: string } }) => (
    <div>{card.id}</div>
  ),
}))

describe('SortableFlashcardList', () => {
  it('virtualizes lists with more than fifty cards', () => {
    useVirtualizerMock.mockReturnValue({
      getTotalSize: () => 1000,
      getVirtualItems: () => [
        { index: 0, key: 'card-0', start: 0 },
        { index: 1, key: 'card-1', start: 200 },
      ],
      measureElement: vi.fn(),
    })
    const cards = Array.from({ length: 51 }, (_, index) => ({
      id: `card-${index}`,
      term: `Term ${index}`,
    }))

    render(
      <SortableFlashcardList
        cards={cards}
        onCardsReorder={vi.fn()}
        onCardChange={vi.fn()}
        onCardDelete={vi.fn()}
        onOpenImagePicker={vi.fn()}
      />
    )

    expect(useVirtualizerMock).toHaveBeenCalledWith(
      expect.objectContaining({ count: 51 })
    )
    expect(screen.getByText('card-0')).toBeInTheDocument()
    expect(screen.queryByText('card-50')).not.toBeInTheDocument()
  })
})
