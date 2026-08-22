import { type HttpClient, api } from '@/shared/api'
import {
  type CreateFlashcardDto,
  type Flashcard,
  type UpdateFlashcardDto,
} from '../model/types'

export function createFlashcardApi(client: HttpClient) {
  return {
    create: (
      deckId: string,
      data: { cards: CreateFlashcardDto[] }
    ): Promise<Flashcard[]> =>
      client.post<Flashcard[]>(`/v1/vocab/decks/${deckId}/cards`, data),

    update: (
      deckId: string,
      cardId: string,
      data: UpdateFlashcardDto
    ): Promise<Flashcard> =>
      client.patch<Flashcard>(
        `/v1/vocab/decks/${deckId}/cards/${cardId}`,
        data
      ),

    delete: (deckId: string, cardId: string): Promise<void> =>
      client.delete<void>(`/v1/vocab/decks/${deckId}/cards/${cardId}`),

    reorder: (deckId: string, orderedCardIds: string[]): Promise<void> =>
      client.put<void>(`/v1/vocab/decks/${deckId}/cards/order`, {
        orderedCardIds,
      }),
  }
}

export const flashcardApi = createFlashcardApi(api)
