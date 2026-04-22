import { startOfDay, addDays, subDays } from 'date-fns'
import { ConfigDrawer } from '@/shared/ui/components/config-drawer'
import { Search } from '@/shared/ui/components/search'
import { ThemeSwitch } from '@/shared/ui/components/theme-switch'
import { CalendarAgendaView } from '@/features/event-calendar/ui/agenda-view/calendar-agenda-view.tsx'
import { sidebarData } from '@/widgets/layout/ui/data/sidebar-data'
import { Header } from '@/widgets/layout/ui/header'
import { Main } from '@/widgets/layout/ui/main'
import { NavUser } from '@/widgets/layout/ui/nav-user'
import {
  CalendarProvider,
  useCalendar,
} from '../../features/event-calendar/model/contexts/calendar-context'
import {
  type IEvent,
  type IUser,
} from '../../features/event-calendar/model/interfaces'
import { DndProviderWrapper } from '../../features/event-calendar/ui/dnd/dnd-provider.tsx'
import { CalendarHeader } from '../../features/event-calendar/ui/header/calendar-header'
import { CalendarMonthView } from '../../features/event-calendar/ui/month-view/calendar-month-view'
import { CalendarDayView } from '../../features/event-calendar/ui/week-and-day-view/calendar-day-view'
import { CalendarWeekView } from '../../features/event-calendar/ui/week-and-day-view/calendar-week-view'
import { CalendarYearView } from '../../features/event-calendar/ui/year-view/calendar-year-view'

const MOCK_USERS: IUser[] = [
  {
    id: '1',
    name: 'John Doe',
    picturePath: null,
  },
  {
    id: '2',
    name: 'Jane Smith',
    picturePath: null,
  },
]

const MOCK_EVENTS: IEvent[] = [
  {
    id: 1,
    title: 'Team Meeting',
    startDate: startOfDay(new Date()).toISOString(),
    endDate: startOfDay(new Date()).toISOString(),
    color: 'blue',
    description: 'Weekly sync',
    user: MOCK_USERS[0],
  },
  {
    id: 2,
    title: 'Workshop',
    startDate: addDays(startOfDay(new Date()), 2).toISOString(),
    endDate: addDays(startOfDay(new Date()), 4).toISOString(),
    color: 'green',
    description: 'React dnd-kit workshop',
    user: MOCK_USERS[1],
  },
  {
    id: 3,
    title: 'Deadline',
    startDate: subDays(startOfDay(new Date()), 1).toISOString(),
    endDate: subDays(startOfDay(new Date()), 1).toISOString(),
    color: 'red',
    description: 'Release deadline',
    user: MOCK_USERS[0],
  },
]

function CalendarContent() {
  const { view, events } = useCalendar()

  const singleDayEvents = events.filter((e) => e.startDate === e.endDate)
  const multiDayEvents = events.filter((e) => e.startDate !== e.endDate)

  return (
    <>
      <div className='mb-6 flex flex-col gap-3'>
        <h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
        <CalendarHeader events={events} />
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
        {view === 'year' && <CalendarYearView allEvents={events} />}
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

export function CalendarPage() {
  return (
    <CalendarProvider users={MOCK_USERS} events={MOCK_EVENTS}>
      <DndProviderWrapper>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <NavUser user={sidebarData.user} />
          </div>
        </Header>
        <Main>
          <CalendarContent />
        </Main>
      </DndProviderWrapper>
    </CalendarProvider>
  )
}
