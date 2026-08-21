import 'server-only'
import { getErrorMessage } from '@/shared/api'
import {
  type Invitation,
  OrganizationSlugSchema,
} from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

type GetOrganizationInvitationsResponse = {
  data: Invitation[] | null
  error: string | null
}

export async function getOrganizationInvitations(
  slug: string
): Promise<GetOrganizationInvitationsResponse> {
  try {
    const validSlug = OrganizationSlugSchema.parse(slug)
    const data = await invitationServerApi.listPending(validSlug)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
