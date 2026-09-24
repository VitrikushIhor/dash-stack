export const unsplashKeys = {
  all: ['unsplash'] as const,
  search: (query: string, page?: number, perPage?: number) =>
    ['unsplash', 'search', query, page ?? 1, perPage ?? 18] as const,
}
