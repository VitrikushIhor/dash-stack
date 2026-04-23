import { z } from 'zod'
import { OrgRole } from '@/shared/model/types/org-role'

export const InviteSchema = z.object({
  email: z.string().email(), // Re-checking: z.string().email() is correct in Zod, z.email() is not a thing. The user meant z.string().email() is preferred over regex.
  role: z.nativeEnum(OrgRole),
})

export type InviteFormValues = z.infer<typeof InviteSchema>
