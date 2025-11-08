import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/shared/ui/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
