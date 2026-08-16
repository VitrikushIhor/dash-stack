'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarRange, Columns, Grid2x2, Grid3x3, List } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { useCalendarSearchParams } from '@/features/task-calendar'

const TABS = [
  { href: '/calendar/day', icon: List, label: 'Day view' },
  { href: '/calendar/week', icon: Columns, label: 'Week view' },
  { href: '/calendar', icon: Grid2x2, label: 'Month view' },
  { href: '/calendar/year', icon: Grid3x3, label: 'Year view' },
  { href: '/calendar/agenda', icon: CalendarRange, label: 'Agenda view' },
]

export function CalendarTabsNav() {
  const pathname = usePathname()
  const [{ date }] = useCalendarSearchParams()

  const searchString = date ? `?date=${format(date, 'yyyy-MM-dd')}` : ''

  return (
    <div className='inline-flex'>
      {TABS.map((tab) => (
        <Button
          key={tab.href}
          asChild
          aria-label={tab.label}
          title={tab.label}
          size='icon'
          variant={pathname === tab.href ? 'default' : 'outline'}
          className='-ml-px first:ml-0 first:rounded-r-none last:rounded-l-none [&_svg]:size-5 [&:not(:first-child):not(:last-child)]:rounded-none'
        >
          <Link href={`${tab.href}${searchString}`}>
            <tab.icon strokeWidth={1.8} />
          </Link>
        </Button>
      ))}
    </div>
  )
}
