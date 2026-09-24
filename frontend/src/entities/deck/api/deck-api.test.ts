import { describe, expect, it, vi } from 'vitest'
import { type HttpClient } from '@/shared/api'
import { type PublicDeckFilters, createDeckApi } from './deck-api'

describe('deckApi.getPublicDecks', () => {
  it('passes language and tags filters to the public catalog endpoint', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({}),
    } as unknown as HttpClient
    const filters = {
      language: 'uk',
      tags: ['verbs', 'daily-use'],
    } as unknown as PublicDeckFilters

    await createDeckApi(client).getPublicDecks(filters)

    expect(client.get).toHaveBeenCalledWith('/v1/vocab/decks/public', {
      params: expect.objectContaining({
        language: 'uk',
        tags: 'verbs,daily-use',
      }),
      next: expect.anything(),
    })
  })
})

describe('deckApi.getMetadata', () => {
  it('loads deck metadata without the full card collection', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({}),
    } as unknown as HttpClient

    await createDeckApi(client).getMetadata('deck-1')

    expect(client.get).toHaveBeenCalledWith(
      '/v1/vocab/decks/deck-1/metadata',
      expect.anything()
    )
  })
})
