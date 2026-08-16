import { CalendarMonthPage } from '@/views/calendar/ui/calendar-month-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function CalendarMonthRoute({ searchParams }: Props) {
  return <CalendarMonthPage searchParams={searchParams} />
}
