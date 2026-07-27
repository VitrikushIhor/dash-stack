'use server'

import { serverApi } from '@/shared/api/server-api-client'

export async function getOrganizationCount() {
  const { count } = await serverApi.get<{
    count: number
  }>('/me/organizations/count')

  return count
}
