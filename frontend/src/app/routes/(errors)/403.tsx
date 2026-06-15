import { createFileRoute } from '@tanstack/react-router'
import { ForbiddenError } from '@/shared/ui'

export const Route = createFileRoute('/(errors)/403')({
  component: ForbiddenError,
})
