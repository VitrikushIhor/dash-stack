import { type HttpClient, api } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config/constants/cache-tags'
import {
  type DeckCardsPage,
  type DueReviewsResponse,
  type MatchCompletion,
  type MatchLeaderboard,
  type MatchSession,
  type StudyCard,
  type StudySessionQuery,
  type SubmitProgressPayload,
  type ToggleStarResponse,
  type VocabProgressResponse,
} from '../model/types'

export function createVocabApi(client: HttpClient) {
  return {
    browseDeckCards: (
      deckId: string,
      query: { search?: string; page: number; perPage: number },
      signal?: AbortSignal
    ): Promise<DeckCardsPage> =>
      client.get<DeckCardsPage>(`/v1/vocab/decks/${deckId}/cards/browse`, {
        params: {
          q: query.search || undefined,
          page: query.page,
          perPage: query.perPage,
        },
        signal,
      }),

    getStudySession: (
      deckId: string,
      query?: Omit<StudySessionQuery, 'deckId'>
    ): Promise<StudyCard[]> => {
      const params: Record<string, string | undefined> = {
        mode: query?.mode,
        onlyStarred:
          query?.onlyStarred !== undefined
            ? String(query.onlyStarred)
            : undefined,
        onlyDue:
          query?.onlyDue !== undefined ? String(query.onlyDue) : undefined,
      }
      return client.get<StudyCard[]>(`/v1/vocab/decks/${deckId}/study`, {
        params,
        next: { tags: [SERVER_CACHE_TAGS.studySession(deckId)] },
      })
    },

    submitProgress: (
      deckId: string,
      dto: Omit<SubmitProgressPayload, 'deckId'>
    ): Promise<VocabProgressResponse[]> =>
      client.post<VocabProgressResponse[]>(
        `/v1/vocab/decks/${deckId}/progress`,
        dto
      ),

    getDueReviews: (deckId?: string): Promise<DueReviewsResponse> => {
      const params = deckId ? { deckId } : undefined
      return client.get<DueReviewsResponse>('/v1/vocab/reviews/due', {
        params,
        next: { tags: [SERVER_CACHE_TAGS.dueReviews] },
      })
    },

    toggleStar: (
      cardId: string,
      dto: { isStarred: boolean }
    ): Promise<ToggleStarResponse> =>
      client.post<ToggleStarResponse>(`/v1/vocab/cards/${cardId}/star`, {
        flashcardId: cardId,
        isStarred: dto.isStarred,
      }),

    getLeaderboard: (
      deckId: string,
      query: { page?: number; perPage?: number } = {}
    ): Promise<MatchLeaderboard> =>
      client.get<MatchLeaderboard>(`/v1/vocab/decks/${deckId}/leaderboard`, {
        params: query,
      }),

    createMatchSession: (
      deckId: string,
      filters: { onlyDue?: boolean; onlyStarred?: boolean }
    ): Promise<MatchSession> =>
      client.post<MatchSession>(
        `/v1/vocab/decks/${deckId}/match/sessions`,
        filters
      ),

    completeMatchSession: (
      deckId: string,
      sessionId: string
    ): Promise<MatchCompletion> =>
      client.post<MatchCompletion>(
        `/v1/vocab/decks/${deckId}/match/sessions/${sessionId}/complete`
      ),
    recordMatchPair: (
      deckId: string,
      sessionId: string,
      cardId: string
    ): Promise<void> =>
      client.post<void>(
        `/v1/vocab/decks/${deckId}/match/sessions/${sessionId}/pairs`,
        { cardId }
      ),
  }
}

export const vocabApi = createVocabApi(api)
