import { CalendarHeader, useCalendar } from '@/features/event-calendar'

export function CalendarHeaderSection() {
  const { events } = useCalendar()

  return (
    <div className='mb-6 flex flex-col gap-3'>
      <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
      <CalendarHeader events={events} />
    </div>
  )
}

