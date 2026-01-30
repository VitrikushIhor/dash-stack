import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '@/pages/auth'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/reset-password')({
  component: ResetPasswordPage,
  validateSearch: searchSchema,
})
