import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/shared/ui/components/coming-soon'

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: ComingSoon,
})
