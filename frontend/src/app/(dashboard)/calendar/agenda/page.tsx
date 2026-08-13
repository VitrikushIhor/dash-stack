import { CalendarAgendaPage } from '@/views/calendar/ui/calendar-agenda-page'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function CalendarAgendaRoute({ searchParams }: Props) {
  return <CalendarAgendaPage searchParams={searchParams} />
}
