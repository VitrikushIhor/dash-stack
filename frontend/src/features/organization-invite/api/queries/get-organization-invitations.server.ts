import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type Invitation, OrganizationIdSchema } from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

type GetOrganizationInvitationsResponse = {
  data: Invitation[] | null
  error: string | null
}

export async function getOrganizationInvitations(
  orgId: string
): Promise<GetOrganizationInvitationsResponse> {
  try {
    const validOrgId = OrganizationIdSchema.parse(orgId)
    const data = await invitationServerApi.listPending(validOrgId)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
