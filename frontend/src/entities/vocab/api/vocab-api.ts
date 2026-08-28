import { type HttpClient, api } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config/constants/cache-tags'
import {
  type DueReviewsResponse,
  type MatchLeaderboardEntry,
  type StudyCard,
  type StudySessionQuery,
  type SubmitMatchScorePayload,
  type SubmitProgressPayload,
  type ToggleStarResponse,
  type VocabProgressResponse,
} from '../model/types'

export function createVocabApi(client: HttpClient) {
  return {
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
      dto: { results: SubmitProgressPayload['results'] }
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

    getLeaderboard: (deckId: string): Promise<MatchLeaderboardEntry[]> =>
      client.get<MatchLeaderboardEntry[]>(
        `/v1/vocab/decks/${deckId}/leaderboard`
      ),

    submitMatchScore: (
      deckId: string,
      dto: Omit<SubmitMatchScorePayload, 'deckId'>
    ): Promise<MatchLeaderboardEntry> =>
      client.post<MatchLeaderboardEntry>(
        `/v1/vocab/decks/${deckId}/leaderboard`,
        dto
      ),
  }
}

export const vocabApi = createVocabApi(api)
