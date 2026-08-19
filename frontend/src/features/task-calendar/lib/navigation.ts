import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ROUTES } from '@/shared/config'
import { useOrgSlug } from '@/entities/organization'
import { type TCalendarView } from '../model/calendar-types'

export function formatCalendarDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getCalendarViewUrl(
  slug: string,
  view: TCalendarView = 'month',
  date?: Date
): string {
  const dateQuery = date ? `?date=${formatCalendarDate(date)}` : ''
  if (view === 'month') {
    return `${ROUTES.orgCalendar(slug)}${dateQuery}`
  }
  return `${ROUTES.orgCalendarView(slug, view)}${dateQuery}`
}

export function useCalendarNavigation() {
  const router = useRouter()
  const slug = useOrgSlug()

  const navigateToView = (view: TCalendarView, date?: Date) => {
    if (!slug) return
    router.push(getCalendarViewUrl(slug, view, date))
  }

  const navigateToDay = (date: Date) => navigateToView('day', date)
  const navigateToMonth = (date: Date) => navigateToView('month', date)

  return {
    slug,
    navigateToView,
    navigateToDay,
    navigateToMonth,
    getViewUrl: (view: TCalendarView, date?: Date) =>
      slug ? getCalendarViewUrl(slug, view, date) : '',
  }
}
