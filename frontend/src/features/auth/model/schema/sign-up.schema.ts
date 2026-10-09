import z from 'zod'
import { passwordSchema } from './password.schema'

export const signUpSchema = z
  .object({
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export const signUpDefaultValues = {
  email: '',
  password: '',
  confirmPassword: '',
}

export type TSignUpSchema = z.infer<typeof signUpSchema>
