import { z } from 'zod'
import {
  OrganizationSlugSchema,
  OrganizationUserIdSchema,
} from '../../model/schemas/organization.schema'

export const GetMemberQuerySchema = z.object({
  slug: OrganizationSlugSchema,
  userId: OrganizationUserIdSchema,
})
