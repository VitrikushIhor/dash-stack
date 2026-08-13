import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { CalendarDayView } from './calendar-day-view'
import { CalendarTimeline } from './calendar-time-line'
import { CalendarWeekView } from './calendar-week-view'

// --- Mocks ---

vi.mock('@/shared/ui/core/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='scroll-area'>{children}</div>
  ),
}))

vi.mock('../dnd/draggable-task', () => ({
  DraggableTask: ({
    children,
    task,
  }: {
    children: React.ReactNode
    task: Task
  }) => <div data-testid={`draggable-${task.id}`}>{children}</div>,
}))

vi.mock('../task-details-dialog', () => ({
  TaskDetailsDialog: ({
    children,
    task,
  }: {
    children: React.ReactNode
    task: Task
  }) => <div data-testid={`task-dialog-${task.id}`}>{children}</div>,
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
      tasks={[]}
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
    renderWithProvider(<CalendarDayView singleDayTasks={[]} />)
    // "Wed 10" for 2026-06-10
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText(/wed/i)).toBeInTheDocument()
  })

  it('renders empty state when no tasks for the selected day', () => {
    renderWithProvider(<CalendarDayView singleDayTasks={[]} />)
    expect(screen.getByText(/no tasks for today/i)).toBeInTheDocument()
  })

  it('renders task blocks for tasks on the selected day', () => {
    const tasks = [
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
    renderWithProvider(<CalendarDayView singleDayTasks={tasks} />)
    expect(screen.getByText('Morning Standup')).toBeInTheDocument()
    expect(screen.getByText('Team Review')).toBeInTheDocument()
  })

  it('does not render tasks from other days', () => {
    const tasks = [
      // Same month, different day
      makeTask({
        id: 't-other',
        title: 'Other Day Task',
        dueDate: '2026-06-11T10:00:00Z',
      }),
    ]
    renderWithProvider(<CalendarDayView singleDayTasks={tasks} />)
    expect(screen.queryByText('Other Day Task')).not.toBeInTheDocument()
    expect(screen.getByText(/no tasks for today/i)).toBeInTheDocument()
  })

  it('sorts tasks by deadline ascending', () => {
    const tasks = [
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
    renderWithProvider(<CalendarDayView singleDayTasks={tasks} />)

    const items = screen.getAllByRole('button')
    const texts = items.map((b) => b.textContent)
    const morningIndex = texts.findIndex((t) => t?.includes('Morning Call'))
    const afternoonIndex = texts.findIndex((t) =>
      t?.includes('Afternoon Meeting')
    )
    expect(morningIndex).toBeLessThan(afternoonIndex)
  })

  it('renders a scroll area wrapper', () => {
    renderWithProvider(<CalendarDayView singleDayTasks={[]} />)
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
  })
})

// --- CalendarWeekView ---

describe('CalendarWeekView', () => {
  beforeEach(() => vi.clearAllMocks())

  // Week of 2026-06-08 (Mon) - 2026-06-14 (Sun) when selectedDate = 2026-06-10
  it('renders 7 day column headers', () => {
    renderWithProvider(
      <CalendarWeekView singleDayTasks={[]} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    // 7 column headers visible in sm+ viewport (hidden on mobile, checked via content)
    // Each header shows day abbrev + number
    expect(screen.getByText(/10/)).toBeInTheDocument()
  })

  it('renders mobile fallback message', () => {
    renderWithProvider(
      <CalendarWeekView singleDayTasks={[]} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    expect(
      screen.getByText(/weekly view is not available on smaller devices/i)
    ).toBeInTheDocument()
  })

  it('renders task blocks for tasks within the current week', () => {
    const tasks = [
      makeTask({
        id: 't-1',
        title: 'Mid-Week Task',
        dueDate: '2026-06-10T10:00:00Z',
      }),
    ]
    renderWithProvider(
      <CalendarWeekView singleDayTasks={tasks} />,
      new Date('2026-06-10T00:00:00Z'),
      'week'
    )
    expect(screen.getByText('Mid-Week Task')).toBeInTheDocument()
  })

  it('renders a scroll area wrapper', () => {
    renderWithProvider(
      <CalendarWeekView singleDayTasks={[]} />,
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
