import { CalendarDayPage } from '@/views/calendar/ui/calendar-day-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function CalendarDayRoute({ searchParams }: Props) {
  return <CalendarDayPage searchParams={searchParams} />
}
