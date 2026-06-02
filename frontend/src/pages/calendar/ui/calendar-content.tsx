import {
  useCalendar,
  useFilteredEvents,
  CalendarAgendaView,
  CalendarHeader,
  CalendarMonthView,
  CalendarDayView,
  CalendarWeekView,
  CalendarYearView,
} from '@/features/event-calendar'

export function CalendarContent() {
  const { view } = useCalendar()
  const { filteredEvents, singleDayEvents, multiDayEvents } =
    useFilteredEvents()

  return (
    <>
      <div className='mb-6 flex flex-col gap-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
        <CalendarHeader events={filteredEvents} />
      </div>

      <div className='bg-card rounded-xl border p-4 shadow-sm'>
        {view === 'day' && (
          <CalendarDayView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'month' && (
          <CalendarMonthView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'week' && (
          <CalendarWeekView
            singleDayEvents={singleDayEvents}
            multiDayEvents={multiDayEvents}
          />
        )}
        {view === 'year' && <CalendarYearView allEvents={filteredEvents} />}
        {view === 'agenda' && (
          <CalendarAgendaView
            multiDayEvents={multiDayEvents}
            singleDayEvents={singleDayEvents}
          />
        )}
      </div>
    </>
  )
}
