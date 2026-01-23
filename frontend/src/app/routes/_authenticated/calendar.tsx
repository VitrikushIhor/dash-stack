import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CalendarPage } from '@/pages/calendar'

const searchSchema = z.object({
  view: z.enum(['day', 'week', 'month', 'year', 'agenda']).optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/calendar')({
  component: CalendarPage,
  validateSearch: searchSchema,
})
