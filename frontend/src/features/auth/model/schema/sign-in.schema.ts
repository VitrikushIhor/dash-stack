import z from 'zod'
import { passwordSchema } from './password.schema'

export const signInSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: passwordSchema,
})

export const signInDefaultValues = {
  email: '',
  password: '',
}

export type TSignInSchema = z.infer<typeof signInSchema>
