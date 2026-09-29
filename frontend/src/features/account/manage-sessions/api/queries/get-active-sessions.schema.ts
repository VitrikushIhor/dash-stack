import { z } from 'zod'

export const GetActiveSessionsSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform(Number)
    .pipe(z.number().int().min(1).max(100000))
    .catch(1),
})
