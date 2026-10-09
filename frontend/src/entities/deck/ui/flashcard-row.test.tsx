import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FlashcardRow } from './flashcard-row'

describe('FlashcardRow', () => {
  it('associates_every_visible_field_label_with_its_control', () => {
    render(
      <FlashcardRow
        card={{
          id: 'card-1',
          term: 'Term',
          definition: 'Definition',
          example: 'Example',
          imageUrl: null,
        }}
        index={0}
        onChange={vi.fn()}
        onDelete={vi.fn()}
        onOpenImagePicker={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/Term \/ Word/)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Definition \/ Translation/)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Example Sentence (Optional)')
    ).toBeInTheDocument()
    expect(screen.getByText('Visual Aid')).toBeInTheDocument()
  })
})
