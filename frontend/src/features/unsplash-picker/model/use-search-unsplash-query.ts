import { useQuery } from '@tanstack/react-query'
import { unsplashApi, unsplashKeys } from '@/entities/deck'

export function useSearchUnsplashQuery(activeQuery: string, enabled: boolean) {
  return useQuery({
    queryKey: unsplashKeys.search(activeQuery),
    queryFn: () => unsplashApi.search(activeQuery, 1, 18),
    enabled: enabled && !!activeQuery,
    staleTime: 5 * 60 * 1000,
  })
}
