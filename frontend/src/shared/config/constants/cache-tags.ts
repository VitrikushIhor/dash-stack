export const SERVER_CACHE_TAGS = {
  user: 'user',
  organizations: 'organizations',
  orgDetail: (slug: string) => `organization-${slug}`,
  orgMembers: (slug: string) => `organization-members-${slug}`,
  tasks: (slug: string) => `tasks-${slug}`,
  taskDetail: (id: string) => `task-${id}`,
  labels: (slug: string) => `labels-${slug}`,
} as const
