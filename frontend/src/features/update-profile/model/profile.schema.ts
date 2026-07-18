import { z } from 'zod'

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First Name must be at least 2 characters.')
    .max(30, 'First Name must not be longer than 30 characters.'),
  lastName: z
    .string()
    .min(2, 'Last Name must be at least 2 characters.')
    .max(30, 'Last Name must not be longer than 30 characters.'),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  email: z
    .string({
      required_error: 'Please enter an email address.',
    })
    .email('Please enter a valid email address.'),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional(),
  avatar: z.any().optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const defaultProfileValues: Partial<ProfileFormValues> = {
  firstName: '',
  lastName: '',
  email: '',
  bio: 'I own a computer.',
  avatar: undefined,
  urls: [
    { value: 'https://shadcn.com' },
    { value: 'http://twitter.com/shadcn' },
  ],
}
