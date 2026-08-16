import { z } from 'zod'
import { userValidationRules } from '@/entities/user'

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

export const UpdateProfileSchema = z.object({
  firstName: userValidationRules.firstName,
  lastName: userValidationRules.lastName,
  email: userValidationRules.email,
  bio: userValidationRules.bio,
  dob: z.date().optional(),
  urls: z
    .array(
      z.object({
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional(),
  avatar: avatarSchema,
})

export type UpdateProfileFormValues = z.infer<typeof UpdateProfileSchema>

