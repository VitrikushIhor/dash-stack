import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type UserMembership } from '../../model/types/organization.types'
import { organizationServerApi } from '../organization-api.server'

type GetOrganizationsResponse = {
  data: UserMembership[] | null
  error: string | null
}

export async function getUserOrganizations(): Promise<GetOrganizationsResponse> {
  try {
    const data = await organizationServerApi.getMyMemberships()
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
