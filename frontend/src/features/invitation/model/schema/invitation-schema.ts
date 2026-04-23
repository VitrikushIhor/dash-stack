import { z } from 'zod'
import { OrgRole } from '@/features/organization/model/types/organization.types'

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgRole),
})

export type InviteFormValues = z.infer<typeof InviteSchema>
