import { z } from 'zod'

export const userValidationRules = {
  firstName: z
    .string()
    .min(2, 'First Name must be at least 2 characters.')
    .max(30, 'First Name must not be longer than 30 characters.'),
  lastName: z
    .string()
    .min(2, 'Last Name must be at least 2 characters.')
    .max(30, 'Last Name must not be longer than 30 characters.'),
  email: z
    .string({
      message: 'Please enter an email address.',
    })
    .min(1, 'Please enter an email address.')
    .email('Please enter a valid email address.'),
  bio: z.string().max(160, 'Bio must not be longer than 160 characters.'),
}

export const UpdateUserDtoSchema = z.object({
  email: userValidationRules.email.optional(),
  firstName: userValidationRules.firstName.nullable().optional(),
  lastName: userValidationRules.lastName.nullable().optional(),
  dob: z.string().nullable().optional(),
  bio: userValidationRules.bio.nullable().optional(),
  urls: z.array(z.string().url('Please enter a valid URL.')).optional(),
  avatar: z.string().nullable().optional(),
})

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>
