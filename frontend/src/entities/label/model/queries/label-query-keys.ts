export const LABEL_QUERY_KEYS = {
  all: ['labels'] as const,
  lists: (orgId: string) => [...LABEL_QUERY_KEYS.all, 'list', orgId] as const,
}
