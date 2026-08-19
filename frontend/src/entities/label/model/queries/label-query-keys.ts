export const LABEL_QUERY_KEYS = {
  all: ['labels'] as const,
  lists: (slug: string) => [...LABEL_QUERY_KEYS.all, 'list', slug] as const,
}
