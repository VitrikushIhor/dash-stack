import z from 'zod'
import { OrgRole } from '@/features/organization'

export const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orgId: z.string(),
  role: z.nativeEnum(OrgRole),
  position: z.string().nullish(),
  joinedAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string().nullish(),
    avatar: z.string().url().nullish(),
  }),
})
