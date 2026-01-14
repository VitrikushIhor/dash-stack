import { createFileRoute } from '@tanstack/react-router'

import { CalendarPage } from '@/pages/calendar'

export const Route = createFileRoute('/_authenticated/calendar')({
  component: CalendarPage,
})
