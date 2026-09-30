import z from 'zod'
import { createPasswordSchema } from './password.schema'

export const resetPasswordSchema = z
  .object({
    password: createPasswordSchema({
      required: 'Please enter a password',
      minimum: 'Password must be at least 8 characters',
    }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const resetPasswordDefaultValues = {
  password: '',
  confirmPassword: '',
}

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>
