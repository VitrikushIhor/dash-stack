import 'server-only'
import { serverApi } from '@/shared/api/server'

export async function getOrganizationCount() {
  const { count } = await serverApi.get<{
    count: number
  }>('/me/organizations/count')

  return count
}
