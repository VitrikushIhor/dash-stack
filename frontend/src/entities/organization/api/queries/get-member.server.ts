import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type Membership } from '@/shared/model'
import {
  OrganizationSlugSchema,
  OrganizationUserIdSchema,
} from '../../model/schemas/organization.schema'
import { organizationServerApi } from '../organization-api.server'

type GetMemberResponse = {
  data: Membership | null
  error: string | null
}

type Params = {
  slug: string
  userId: string
}

export async function getMember(params: Params): Promise<GetMemberResponse> {
  try {
    const validSlug = OrganizationSlugSchema.parse(params.slug)
    const validUserId = OrganizationUserIdSchema.parse(params.userId)
    const data = await organizationServerApi.getMember({
      slug: validSlug,
      userId: validUserId,
    })
    return { data, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
