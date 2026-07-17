import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailPage } from '@/pages/auth'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/verify-email')({
  component: VerifyEmailPage,
  validateSearch: searchSchema,
})
