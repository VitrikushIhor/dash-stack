import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type Membership } from '@/shared/model'
import {
  OrganizationIdSchema,
  OrganizationUserIdSchema,
} from '../../model/schemas/organization.schema'
import { organizationServerApi } from '../organization-api.server'

type GetMemberResponse = {
  data: Membership | null
  error: string | null
}

type Params = {
  orgId: string
  userId: string
}

export async function getMember(params: Params): Promise<GetMemberResponse> {
  try {
    const validOrgId = OrganizationIdSchema.parse(params.orgId)
    const validUserId = OrganizationUserIdSchema.parse(params.userId)
    const data = await organizationServerApi.getMember({
      orgId: validOrgId,
      userId: validUserId,
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
