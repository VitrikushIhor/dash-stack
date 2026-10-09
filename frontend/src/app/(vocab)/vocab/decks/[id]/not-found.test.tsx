import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import VocabDeckNotFound from './not-found'

describe('VocabDeckNotFound', () => {
  it('directs a visitor to the public catalog after a deck is unavailable', () => {
    render(<VocabDeckNotFound />)

    expect(
      screen.getByRole('heading', { name: 'Vocabulary deck not found' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse vocabulary decks' })
    ).toHaveAttribute('href', '/vocab/catalog')
  })
})
