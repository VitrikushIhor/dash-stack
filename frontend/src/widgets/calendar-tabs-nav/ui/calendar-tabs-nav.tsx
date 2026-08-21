'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarRange, Columns, Grid2x2, Grid3x3, List } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  type TCalendarView,
  getCalendarViewUrl,
  useCalendarSearchParams,
} from '@/features/task-calendar'

interface CalendarTabsNavProps {
  slug: string
}

export function CalendarTabsNav({ slug }: CalendarTabsNavProps) {
  const pathname = usePathname()
  const [{ date }] = useCalendarSearchParams()

  const tabs: Array<{
    view: TCalendarView
    href: string
    icon: typeof List
    label: string
  }> = [
    {
      view: 'day',
      href: getCalendarViewUrl(slug, 'day', date ?? undefined),
      icon: List,
      label: 'Day view',
    },
    {
      view: 'week',
      href: getCalendarViewUrl(slug, 'week', date ?? undefined),
      icon: Columns,
      label: 'Week view',
    },
    {
      view: 'month',
      href: getCalendarViewUrl(slug, 'month', date ?? undefined),
      icon: Grid2x2,
      label: 'Month view',
    },
    {
      view: 'year',
      href: getCalendarViewUrl(slug, 'year', date ?? undefined),
      icon: Grid3x3,
      label: 'Year view',
    },
    {
      view: 'agenda',
      href: getCalendarViewUrl(slug, 'agenda', date ?? undefined),
      icon: CalendarRange,
      label: 'Agenda view',
    },
  ]

  return (
    <div className='inline-flex'>
      {tabs.map((tab) => {
        const basePath = getCalendarViewUrl(slug, tab.view).split('?')[0]
        const isActive = pathname === basePath

        return (
          <Button
            key={tab.view}
            asChild
            aria-label={tab.label}
            title={tab.label}
            size='icon'
            variant={isActive ? 'default' : 'outline'}
            className='-ml-px first:ml-0 first:rounded-r-none last:rounded-l-none [&_svg]:size-5 [&:not(:first-child):not(:last-child)]:rounded-none'
          >
            <Link href={tab.href}>
              <tab.icon strokeWidth={1.8} />
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
