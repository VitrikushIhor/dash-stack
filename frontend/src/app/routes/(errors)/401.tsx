import { createFileRoute } from '@tanstack/react-router'
import { UnauthorisedError } from '@/shared/ui'

export const Route = createFileRoute('/(errors)/401')({
  component: UnauthorisedError,
})
