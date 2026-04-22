import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/widgets/layout/ui/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
