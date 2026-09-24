import { z } from 'zod'

export const AppearanceTheme = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

export const appearanceFormSchema = z.object({
  theme: z.enum([
    AppearanceTheme.LIGHT,
    AppearanceTheme.DARK,
    AppearanceTheme.SYSTEM,
  ]),
})

export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>
