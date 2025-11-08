import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceError } from '@/shared/ui/components/errors'

export const Route = createFileRoute('/(errors)/503')({
  component: MaintenanceError,
})
