import { createFileRoute } from '@tanstack/react-router'
import { NotFoundError } from '@/shared/ui'

export const Route = createFileRoute('/(errors)/404')({
  component: NotFoundError,
})
