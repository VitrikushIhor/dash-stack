import { z } from 'zod'

export const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
})

export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>
