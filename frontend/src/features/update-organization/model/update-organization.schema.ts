import { type z, z as zod } from 'zod'
import {
  BaseOrgSchema,
  OrganizationSlugSchema,
  UpdateOrganizationDtoSchema,
} from '@/entities/organization'

export const UpdateOrgSchema = BaseOrgSchema

export type UpdateOrgFormValues = z.infer<typeof UpdateOrgSchema>

export const UpdateOrganizationActionSchema = zod.object({
  slug: OrganizationSlugSchema,
  dto: UpdateOrganizationDtoSchema,
})
