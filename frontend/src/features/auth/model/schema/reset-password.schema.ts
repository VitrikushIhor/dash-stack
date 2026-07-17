import z from 'zod'

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Please enter a password')
      .min(7, 'Password must be at least 7 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const resetPasswordDefaultValues = {
  password: '',
}

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>
