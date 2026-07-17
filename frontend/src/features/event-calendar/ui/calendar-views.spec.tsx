import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../model/calendar-context'
import {
  type IUser,
  type ICalendarCell,
  type TCalendarView,
} from '../model/types'
import { CalendarAgendaView } from './agenda-view/calendar-agenda-view'
import { CalendarHeader } from './header/calendar-header'
import { CalendarMonthView } from './month-view/calendar-month-view'

// --- Helper ---

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// --- Mocks ---

const mockOpenCreate = vi.fn()
vi.mock('@/features/manage-task', () => ({
  useTaskModalStore: () => ({
    openCreate: mockOpenCreate,
  }),
}))

vi.mock('@/shared/ui/core/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='scroll-area'>{children}</div>
  ),
}))

vi.mock('@/shared/ui/core/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('./month-view/day-cell', () => ({
  DayCell: ({ cell, events }: { cell: ICalendarCell; events: Task[] }) => (
    <div data-testid={`day-cell-${getLocalDateString(cell.date)}`}>
      <span>{cell.day}</span>
      <span>{events.length} events</span>
    </div>
  ),
}))

vi.mock('./agenda-view/agenda-day-group', () => ({
  AgendaDayGroup: ({ date, events }: { date: Date; events: Task[] }) => (
    <div data-testid={`agenda-group-${getLocalDateString(date)}`}>
      <span>Agenda Day: {getLocalDateString(date)}</span>
      <span>{events.length} items</span>
    </div>
  ),
}))

vi.mock('./header/date-navigator', () => ({
  DateNavigator: ({ view }: { view: TCalendarView }) => (
    <div data-testid='date-navigator'>Navigator: {view}</div>
  ),
}))

vi.mock('./header/today-button', () => ({
  TodayButton: () => <button data-testid='today-button'>Today</button>,
}))

vi.mock('./header/user-select', () => ({
  UserSelect: () => <div data-testid='user-select'>User Selector</div>,
}))

// --- Test Data ---

const mockUsers: IUser[] = [
  { id: 'u-1', name: 'User 1', avatar: null },
  { id: 'u-2', name: 'User 2', avatar: 'avatar.jpg' },
]

const mockEvents: Task[] = [
  {
    id: 't-1',
    title: 'Event 1',
    status: TaskStatusEnum.PLANNED,
    dueDate: '2026-06-10T12:00:00Z',
    attachments: [],
    organizationId: 'org-1',
    createdAt: '',
    updatedAt: '',
    assignees: [],
    label: { id: 'l1', name: 'Low', color: 'blue' as const },
  },
]

describe('Calendar Views & Header Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CalendarMonthView', () => {
    it('renders weekdays and grid cell items correctly', () => {
      const selectedDate = new Date('2026-06-10T12:00:00Z')
      render(
        <CalendarProvider
          users={mockUsers}
          events={mockEvents}
          selectedDate={selectedDate}
        >
          <CalendarMonthView singleDayEvents={mockEvents} />
        </CalendarProvider>
      )

      // Verify weekdays headers
      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Wed')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()

      // Verify a specific day cell exists (e.g. 2026-06-10)
      expect(screen.getByTestId('day-cell-2026-06-10')).toBeInTheDocument()
    })
  })

  describe('CalendarAgendaView', () => {
    it('renders agenda groups of events for current month', () => {
      const selectedDate = new Date('2026-06-10T12:00:00Z')
      render(
        <CalendarProvider
          users={mockUsers}
          events={mockEvents}
          selectedDate={selectedDate}
        >
          <CalendarAgendaView singleDayEvents={mockEvents} />
        </CalendarProvider>
      )

      // Verify correct day group exists
      expect(screen.getByTestId('agenda-group-2026-06-10')).toBeInTheDocument()
    })

    it('renders empty placeholder when there are no events', () => {
      const selectedDate = new Date('2026-06-10T12:00:00Z')
      render(
        <CalendarProvider
          users={mockUsers}
          events={[]}
          selectedDate={selectedDate}
        >
          <CalendarAgendaView singleDayEvents={[]} />
        </CalendarProvider>
      )

      expect(
        screen.getByText('No events scheduled for the selected month')
      ).toBeInTheDocument()
    })
  })

  describe('CalendarHeader', () => {
    it('displays navigators and buttons, and allows switching views', async () => {
      const user = userEvent.setup()
      const selectedDate = new Date('2026-06-10T12:00:00Z')

      render(
        <CalendarProvider
          users={mockUsers}
          events={mockEvents}
          selectedDate={selectedDate}
          view='month'
        >
          <CalendarHeader events={mockEvents} />
        </CalendarProvider>
      )

      // Subcomponents rendered
      expect(screen.getByTestId('today-button')).toBeInTheDocument()
      expect(screen.getByTestId('date-navigator')).toBeInTheDocument()
      expect(screen.getByTestId('user-select')).toBeInTheDocument()

      // Toggles views
      const weekViewBtn = screen.getByRole('button', { name: /view by week/i })
      await user.click(weekViewBtn)
      // Check if navigator view updated through context view change
      expect(screen.getByTestId('date-navigator')).toHaveTextContent(
        'Navigator: week'
      )

      const agendaViewBtn = screen.getByRole('button', {
        name: /view by agenda/i,
      })
      await user.click(agendaViewBtn)
      expect(screen.getByTestId('date-navigator')).toHaveTextContent(
        'Navigator: agenda'
      )
    })

    it('triggers openCreate modal store action when clicking Add Event button', async () => {
      const user = userEvent.setup()
      const selectedDate = new Date('2026-06-10T12:00:00Z')

      render(
        <CalendarProvider
          users={mockUsers}
          events={mockEvents}
          selectedDate={selectedDate}
          onCreateTask={mockOpenCreate}
        >
          <CalendarHeader events={mockEvents} />
        </CalendarProvider>
      )

      const addEventBtn = screen.getByRole('button', { name: /add event/i })
      await user.click(addEventBtn)

      expect(mockOpenCreate).toHaveBeenCalledTimes(1)
    })
  })
})
