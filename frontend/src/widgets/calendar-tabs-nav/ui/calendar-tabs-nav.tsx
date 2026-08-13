'use client'

import { UrlTabsNav, type UrlTabProps } from '@/shared/ui/core/url-tabs-nav'

const tabs: UrlTabProps[] = [
  {
    value: null,
    label: 'Month',
    href: '/calendar',
  },
  {
    value: 'week',
    label: 'Week',
    href: '/calendar/week',
  },
  {
    value: 'day',
    label: 'Day',
    href: '/calendar/day',
  },
  {
    value: 'year',
    label: 'Year',
    href: '/calendar/year',
  },
  {
    value: 'agenda',
    label: 'Agenda',
    href: '/calendar/agenda',
  },
]

export function CalendarTabsNav() {
  return <UrlTabsNav tabs={tabs} ariaLabel='Calendar views' />
}
