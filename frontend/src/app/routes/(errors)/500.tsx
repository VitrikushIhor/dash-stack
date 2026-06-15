import { createFileRoute } from '@tanstack/react-router'
import { GeneralError } from '@/shared/ui'

export const Route = createFileRoute('/(errors)/500')({
  component: GeneralError,
})
