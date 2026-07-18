import { z } from 'zod'

const avatarSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('file'),
    value: z
      .instanceof(File)
      .refine((f) => f.size <= 5_000_000, 'Max size is 5MB')
      .refine((f) => f.type.startsWith('image/'), 'Must be an image'),
  }),
  z.object({
    kind: z.literal('key'),
    value: z.string().min(1),
  }),
  z.object({
    kind: z.literal('none'),
  }),
])

export type AvatarValue = z.infer<typeof avatarSchema>

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First Name must be at least 2 characters.')
    .max(30, 'First Name must not be longer than 30 characters.'),
  lastName: z
    .string()
    .min(2, 'Last Name must be at least 2 characters.')
    .max(30, 'Last Name must not be longer than 30 characters.'),
  dob: z.date().optional(),
  email: z
    .string({
      message: 'Please enter an email address.',
    })
    .min(1, 'Please enter an email address.')
    .email('Please enter a valid email address.'),
  bio: z.string().max(160, 'Bio must not be longer than 160 characters.'),
  urls: z
    .array(
      z.object({
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional(),
  avatar: avatarSchema,
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const defaultProfileValues: Partial<ProfileFormValues> = {
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  avatar: { kind: 'none' },
  urls: [],
}
