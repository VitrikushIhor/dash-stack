import { createFileRoute } from '@tanstack/react-router'
import { UnauthorisedError } from '@/shared/ui/components/errors'

export const Route = createFileRoute('/(errors)/401')({
  component: UnauthorisedError,
})
