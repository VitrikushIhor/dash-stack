import { cva } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { calendarTaskCardColors } from './calendar-task-palette'

export const agendaEventCardVariants = cva(
  'flex select-none items-center justify-between gap-3 rounded-md border p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  {
    variants: {
      color: calendarTaskCardColors,
    },
    defaultVariants: {
      color: 'blue-dot',
    },
  }
)

export const calendarWeekEventCardVariants = cva(
  'flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  {
    variants: {
      color: {
        ...calendarTaskCardColors,
        gray: cn(calendarTaskCardColors.gray, 'text-neutral-700'),
      },
    },
    defaultVariants: {
      color: 'blue-dot',
    },
  }
)

export const eventBadgeVariants = cva(
  'mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  {
    variants: {
      color: calendarTaskCardColors,
    },
    defaultVariants: {
      color: 'blue-dot',
    },
  }
)
