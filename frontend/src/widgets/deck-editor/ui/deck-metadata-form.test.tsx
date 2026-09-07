import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { type Deck } from '@/entities/deck'
import { useDeckMetadata } from '../model/use-deck-metadata'
import { DeckMetadataForm } from './deck-metadata-form'

const deck: Deck = {
  id: 'deck-1',
  ownerUserId: 'user-1',
  title: 'Ukrainian basics',
  language: 'uk',
  tags: ['verbs'],
  visibility: 'PRIVATE',
  status: 'DRAFT',
  type: 'USER_GENERATED',
  createdAt: '2026-09-07T12:00:00.000Z',
  updatedAt: '2026-09-07T12:00:00.000Z',
}

function MetadataFormHarness() {
  return <DeckMetadataForm state={useDeckMetadata(deck)} />
}

describe('DeckMetadataForm', () => {
  it('allows editing the language and tags', async () => {
    const user = userEvent.setup()
    render(<MetadataFormHarness />)

    const language = screen.getByLabelText('Language')
    await user.clear(language)
    await user.type(language, 'pl')
    await user.type(screen.getByLabelText('Tags'), 'daily use{Enter}')

    expect(language).toHaveValue('pl')
    expect(screen.getByText('#verbs')).toBeInTheDocument()
    expect(screen.getByText('#daily use')).toBeInTheDocument()
  })
})
