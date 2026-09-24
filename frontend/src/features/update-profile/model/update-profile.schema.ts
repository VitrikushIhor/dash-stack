import { z } from 'zod'
import { userValidationRules } from '@/entities/user'

export const AvatarValueKind = {
  FILE: 'file',
  KEY: 'key',
  NONE: 'none',
} as const

const avatarSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal(AvatarValueKind.FILE),
    value: z
      .instanceof(File)
      .refine((f) => f.size <= 5_000_000, 'Max size is 5MB')
      .refine((f) => f.type.startsWith('image/'), 'Must be an image'),
  }),
  z.object({
    kind: z.literal(AvatarValueKind.KEY),
    value: z.string().min(1),
  }),
  z.object({
    kind: z.literal(AvatarValueKind.NONE),
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
        value: z.url('Please enter a valid URL.'),
      })
    )
    .optional(),
  avatar: avatarSchema,
})

export type UpdateProfileFormValues = z.infer<typeof UpdateProfileSchema>
