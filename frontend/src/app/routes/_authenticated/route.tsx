import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/widgets/layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
