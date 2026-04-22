import z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
})

export const forgotPasswordDefaultValues = {
  email: '',
}

export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
