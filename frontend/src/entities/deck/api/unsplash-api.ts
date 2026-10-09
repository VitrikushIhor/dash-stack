import { type HttpClient, api } from '@/shared/api'
import { type UnsplashSearchResult } from '../model/types'

function createUnsplashApi(client: HttpClient) {
  return {
    search: (
      query: string,
      page: number = 1,
      perPage: number = 12
    ): Promise<UnsplashSearchResult> =>
      client.get<UnsplashSearchResult>('/v1/vocab/unsplash/search', {
        params: {
          q: query,
          page: page.toString(),
          perPage: perPage.toString(),
        },
      }),
  }
}

export const unsplashApi = createUnsplashApi(api)
