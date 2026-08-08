import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { serverApi } from '@/shared/api/server-api-client'
import { type UserMembership } from '../../model/types/organization.types'

type GetOrganizationsResponse = {
  data: UserMembership[] | null
  error: string | null
}

export async function getUserOrganizations(): Promise<GetOrganizationsResponse> {
  try {
    const data = await serverApi.get<UserMembership[]>('/me/memberships')
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
