import { z } from 'zod'
import { OrgRole } from '@/shared/model'

export const InviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.nativeEnum(OrgRole),
})

export type InviteFormValues = z.infer<typeof InviteFormSchema>
