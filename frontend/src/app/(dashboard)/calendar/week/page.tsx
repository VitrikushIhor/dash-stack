import { CalendarWeekPage } from '@/views/calendar/ui/calendar-week-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function CalendarWeekRoute({ searchParams }: Props) {
  return <CalendarWeekPage searchParams={searchParams} />
}
