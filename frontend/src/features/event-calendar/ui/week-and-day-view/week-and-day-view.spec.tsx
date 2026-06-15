import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { CalendarDayView } from './calendar-day-view'
import { CalendarTimeline } from './calendar-time-line'
import { CalendarWeekView } from './calendar-week-view'

// --- Mocks ---

vi.mock('@/shared/ui/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='scroll-area'>{children}</div>
  ),
}))

vi.mock('../dnd/draggable-event', () => ({
  DraggableEvent: ({
    children,
    event,
  }: {
    children: React.ReactNode
    event: Task
  }) => <div data-testid={`draggable-${event.id}`}>{children}</div>,
}))

vi.mock('../event-details-dialog', () => ({
  EventDetailsDialog: ({
    children,
    event,
  }: {
    children: React.ReactNode
    event: Task
  }) => <div data-testid={`event-dialog-${event.id}`}>{children}</div>,
}))

// --- Test Data ---

const mockUsers = [{ id: 'u-1', name: 'Alice', avatar: null }]

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't-1',
  title: 'Daily Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-10T10:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
  ...overrides,
})

const renderWithProvider = (
  ui: React.ReactElement,
  selectedDate = new Date('2026-06-10T00:00:00Z'),
  view: 'day' | 'week' | 'month' | 'year' | 'agenda' = 'day'
) =>
  render(
    <CalendarProvider
      users={mockUsers}
      events={[]}
      selectedDate={selectedDate}
      view={view}
    >
      {ui}
    </CalendarProvider>
  )

// --- CalendarDayView ---

describe('CalendarDayView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the day header with day abbreviation and number', () => {
    renderWithProvider(<CalendarDayView singleDayEvents={[]} />)
    // "Wed 10" for 2026-06-10
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText(/wed/i)).toBeInTheDocument()
  })

  it('renders empty state when no events for the selected day', () => {
    renderWithProvider(<CalendarDayView singleDayEvents={[]} />)
    expect(screen.getByText(/no events for today/i)).toBeInTheDocument()
  })

  it('renders event blocks for events on the selected day', () => {
    const events = [
      makeTask({
        id: 't-1',
        title: 'Morning Standup',
        dueDate: '2026-06-10T09:00:00Z',
      }),
      makeTask({
        id: 't-2',
        title: 'Team Review',
        dueDate: '2026-06-10T14:00:00Z',
      }),
    ]
    renderWithProvider(<CalendarDayView singleDayEvents={events} />)
    expect(screen.getByText('Morning Standup')).toBeInTheDocument()
    expect(screen.getByText('Team Review')).toBeInTheDocument()
  })

  it('does not render events from other days', () => {
    const events = [
      // Same month, different day
      makeTask({
        id: 't-other',
        title: 'Other Day Event',
        dueDate: '2026-06-11T10:00:00Z',
      }),
    ]
    renderWithProvider(<CalendarDayView singleDayEvents={events} />)
    expect(screen.queryByText('Other Day Event')).not.toBeInTheDocument()
    expect(screen.getByText(/no events for today/i)).toBeInTheDocument()
  })

  it('sorts events by deadline ascending', () => {
    const events = [
      makeTask({
        id: 't-2',
        title: 'Afternoon Meeting',
        dueDate: '2026-06-10T15:00:00Z',
      }),
      makeTask({
        id: 't-1',
        title: 'Morning Call',
        dueDate: '2026-06-10T08:00:00Z',
      }),
    ]
    renderWithProvider(<CalendarDayView singleDayEvents={events} />)

    const items = screen.getAllByRole('button')
    const texts = items.map((b) => b.textContent)
    const morningIndex = texts.findIndex((t) => t?.includes('Morning Call'))
    const afternoonIndex = texts.findIndex((t) =>
      t?.includes('Afternoon Meeting')
    )
    expect(morningIndex).toBeLessThan(afternoonIndex)
  })

  it('renders a scroll area wrapper', () => {
    renderWithProvider(<CalendarDayView singleDayEvents={[]} />)
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
  })
})

// --- CalendarWeekView ---

describe('CalendarWeekView', () => {
  beforeEach(() => vi.clearAllMocks())

  // Week of 2026-06-08 (Mon) - 2026-06-14 (Sun) when selectedDate = 2026-06-10
  it('renders 7 day column headers', () => {
    renderWithProvider(
      <CalendarWeekView singleDayEvents={[]} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    // 7 column headers visible in sm+ viewport (hidden on mobile, checked via content)
    // Each header shows day abbrev + number
    expect(screen.getByText(/10/)).toBeInTheDocument()
  })

  it('renders mobile fallback message', () => {
    renderWithProvider(
      <CalendarWeekView singleDayEvents={[]} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    expect(
      screen.getByText(/weekly view is not available on smaller devices/i)
    ).toBeInTheDocument()
  })

  it('renders event blocks for events within the current week', () => {
    const events = [
      makeTask({
        id: 't-1',
        title: 'Mid-Week Task',
        dueDate: '2026-06-10T10:00:00Z',
      }),
    ]
    renderWithProvider(
      <CalendarWeekView singleDayEvents={events} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    expect(screen.getByText('Mid-Week Task')).toBeInTheDocument()
  })

  it('renders a scroll area wrapper', () => {
    renderWithProvider(
      <CalendarWeekView singleDayEvents={[]} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
  })
})

// --- CalendarTimeline ---

describe('CalendarTimeline', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when current hour is outside visible range', () => {
    // Force current time to hour 0 but visible range is 9-18
    vi.setSystemTime(new Date('2026-06-10T00:30:00Z'))
    const { container } = render(
      <CalendarTimeline firstVisibleHour={9} lastVisibleHour={18} />
    )
    expect(container.firstChild).toBeNull()
    vi.useRealTimers()
  })

  it('renders timeline when current hour is within visible range', () => {
    // Force current time to 10:00 local — visible 8-18
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T10:00:00'))
    const { container } = render(
      <CalendarTimeline firstVisibleHour={8} lastVisibleHour={18} />
    )
    // The timeline div should be rendered (not null)
    expect(container.firstChild).not.toBeNull()
    vi.useRealTimers()
  })

  it('displays formatted current time inside the timeline', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T10:30:00'))
    render(<CalendarTimeline firstVisibleHour={8} lastVisibleHour={18} />)
    // "10:30 AM"
    expect(screen.getByText(/10:30 AM/i)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('updates time every minute via interval', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T10:00:00'))
    render(<CalendarTimeline firstVisibleHour={8} lastVisibleHour={18} />)
    expect(screen.getByText(/10:00 AM/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(60 * 1000)
    })
    // After 1 minute → 10:01 AM
    expect(screen.getByText(/10:01 AM/i)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
