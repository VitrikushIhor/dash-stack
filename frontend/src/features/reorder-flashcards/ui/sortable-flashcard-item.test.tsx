import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SortableFlashcardItem } from './sortable-flashcard-item'

const { flashcardRowMock } = vi.hoisted(() => ({
  flashcardRowMock: vi.fn(() => <div>Flashcard row</div>),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}))

vi.mock('@/entities/deck', () => ({ FlashcardRow: flashcardRowMock }))

describe('SortableFlashcardItem', () => {
  it('does not rerender an unchanged card when its parent rerenders', () => {
    const props = {
      card: { id: 'card-1', term: 'hello' },
      index: 0,
      onCardChange: vi.fn(),
      onCardDelete: vi.fn(),
      onOpenImagePicker: vi.fn(),
    }
    const view = render(<SortableFlashcardItem {...props} />)

    view.rerender(<SortableFlashcardItem {...props} />)

    expect(flashcardRowMock).toHaveBeenCalledTimes(1)
  })
})
