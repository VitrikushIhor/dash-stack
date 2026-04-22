import z from 'zod'

export const signInSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

export const signInDefaultValues = {
  email: '',
  password: '',
}

export type TSignInSchema = z.infer<typeof signInSchema>
