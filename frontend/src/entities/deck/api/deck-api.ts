import { type HttpClient, type PaginatedResult, api } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config/constants/cache-tags'
import {
  type CreateDeckDto,
  type Deck,
  type DeckEditorSaveResponse,
  type DeckStatusEnum,
  type SaveDeckEditorDto,
  type UpdateDeckDto,
} from '../model/types'

export interface PublicDeckFilters {
  q?: string
  level?: string
  language?: string
  tags?: string[]
  page?: number
  perPage?: number
}

export function createDeckApi(client: HttpClient) {
  return {
    getMyDecks: (status?: DeckStatusEnum): Promise<Deck[]> => {
      const params = status ? { status } : undefined

      return client.get<Deck[]>('/v1/vocab/decks', {
        params,
        next: { tags: [SERVER_CACHE_TAGS.decks] },
      })
    },

    getPublicDecks: (
      filters?: PublicDeckFilters
    ): Promise<PaginatedResult<Deck>> => {
      const params: Record<string, string | undefined> = {
        q: filters?.q,
        level: filters?.level,
        language: filters?.language,
        tags: filters?.tags?.join(','),
        page: filters?.page?.toString(),
        perPage: filters?.perPage?.toString(),
      }

      return client.get<PaginatedResult<Deck>>('/v1/vocab/decks/public', {
        params,
        next: { tags: [SERVER_CACHE_TAGS.decks] },
      })
    },

    getById: (id: string): Promise<Deck> =>
      client.get<Deck>(`/v1/vocab/decks/${id}`, {
        next: { tags: [SERVER_CACHE_TAGS.deckDetail(id)] },
      }),

    create: (data: CreateDeckDto): Promise<Deck> =>
      client.post<Deck>('/v1/vocab/decks', data),

    update: (id: string, data: UpdateDeckDto): Promise<Deck> =>
      client.patch<Deck>(`/v1/vocab/decks/${id}`, data),

    saveEditor: (
      id: string,
      data: SaveDeckEditorDto
    ): Promise<DeckEditorSaveResponse> =>
      client.put<DeckEditorSaveResponse>(`/v1/vocab/decks/${id}/editor`, data),

    delete: (id: string): Promise<void> =>
      client.delete<void>(`/v1/vocab/decks/${id}`),

    publish: (id: string): Promise<Deck> =>
      client.post<Deck>(`/v1/vocab/decks/${id}/publish`),

    unpublish: (id: string): Promise<Deck> =>
      client.post<Deck>(`/v1/vocab/decks/${id}/unpublish`),

    archive: (id: string): Promise<Deck> =>
      client.post<Deck>(`/v1/vocab/decks/${id}/archive`),

    restore: (id: string): Promise<Deck> =>
      client.post<Deck>(`/v1/vocab/decks/${id}/restore`),

    fork: (id: string): Promise<Deck> =>
      client.post<Deck>(`/v1/vocab/decks/${id}/fork`),
  }
}

export const deckApi = createDeckApi(api)
