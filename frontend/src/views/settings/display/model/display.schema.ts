import { z } from 'zod'
import { type DefaultValues } from 'react-hook-form'

export const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
})

export type DisplayFormValues = z.infer<typeof displayFormSchema>

export const displayDefaultValues: DefaultValues<DisplayFormValues> = {
  items: ['recents', 'home'],
}
