import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceError } from '@/shared/ui'

export const Route = createFileRoute('/(errors)/503')({
  component: MaintenanceError,
})
