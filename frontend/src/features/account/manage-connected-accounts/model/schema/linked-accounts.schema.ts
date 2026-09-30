import { z } from 'zod'

export const linkedAccountsSchema = z.object({
  providers: z.array(z.string().min(1)).max(10),
})
