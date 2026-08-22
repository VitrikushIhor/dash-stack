import 'server-only'
import { serverApi } from '@/shared/api/server-api-client'
import { type UnsplashSearchResult } from '../model/types'

export const unsplashServerApi = {
  search: async (
    query: string,
    page: number = 1,
    perPage: number = 12
  ): Promise<UnsplashSearchResult> => {
    return serverApi.get<UnsplashSearchResult>('/v1/vocab/unsplash/search', {
      params: {
        q: query,
        page: page.toString(),
        perPage: perPage.toString(),
      },
      next: { revalidate: 3600 },
    })
  },
}
