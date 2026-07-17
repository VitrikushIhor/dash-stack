import { z } from 'zod'
import { OrgRole } from '@/shared/model'

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgRole),
})

export type InviteFormValues = z.infer<typeof InviteSchema>
