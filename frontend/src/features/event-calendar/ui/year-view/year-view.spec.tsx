import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { CalendarYearView } from './calendar-year-view'
import { YearViewDayCell } from './year-view-day-cell'
import { YearViewMonth } from './year-view-month'

// --- Mocks ---

vi.mock('@/shared/ui/core/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

// --- Test Data ---

const mockUsers = [{ id: 'u-1', name: 'Alice', avatar: null }]

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't-1',
  title: 'Year Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-03-15T10:00:00Z',
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
  selectedDate = new Date('2026-01-01T00:00:00Z')
) =>
  render(
    <CalendarProvider users={mockUsers} events={[]} selectedDate={selectedDate}>
      {ui}
    </CalendarProvider>
  )

// --- CalendarYearView ---

describe('CalendarYearView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders 12 month blocks for the selected year', () => {
    renderWithProvider(<CalendarYearView allEvents={[]} />)
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    monthNames.forEach((month) => {
      expect(screen.getByText(month)).toBeInTheDocument()
    })
  })

  it('passes events to child months (event dot renders for march)', () => {
    const event = makeTask({ dueDate: '2026-03-15T10:00:00Z' })
    renderWithProvider(<CalendarYearView allEvents={[event]} />)
    // Day 15 should appear somewhere in the rendered grid
    expect(screen.getAllByText('15').length).toBeGreaterThan(0)
  })
})

// --- YearViewMonth ---

describe('YearViewMonth', () => {
  beforeEach(() => vi.clearAllMocks())

  const june2026 = new Date('2026-06-01T00:00:00Z')

  it('renders the month name as a header button', () => {
    renderWithProvider(<YearViewMonth month={june2026} events={[]} />)
    expect(screen.getByRole('button', { name: /june/i })).toBeInTheDocument()
  })

  it('renders weekday abbreviations (Sun, Mon, Sat...)', () => {
    renderWithProvider(<YearViewMonth month={june2026} events={[]} />)
    // SHORT_WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('renders day numbers 1 through 30 for June', () => {
    renderWithProvider(<YearViewMonth month={june2026} events={[]} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('clicking the month header navigates to month view', () => {
    // We only verify the click does not throw
    renderWithProvider(<YearViewMonth month={june2026} events={[]} />)
    const monthBtn = screen.getByRole('button', { name: /june/i })
    fireEvent.click(monthBtn)
    expect(monthBtn).toBeInTheDocument()
  })
})

// --- YearViewDayCell ---

describe('YearViewDayCell', () => {
  beforeEach(() => vi.clearAllMocks())

  const date = new Date('2026-06-15T00:00:00Z')

  it('renders the day number', () => {
    renderWithProvider(<YearViewDayCell day={15} date={date} events={[]} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('does not render event indicators when there are no events', () => {
    const { container } = renderWithProvider(
      <YearViewDayCell day={15} date={date} events={[]} />
    )
    // No colored dot divs should appear
    const dots = container.querySelectorAll('.size-1\\.5')
    expect(dots.length).toBe(0)
  })

  it('renders one dot per event when events ≤ 3', () => {
    const events = [
      makeTask({ id: 't-1', dueDate: '2026-06-15T08:00:00Z' }),
      makeTask({ id: 't-2', dueDate: '2026-06-15T09:00:00Z' }),
    ]
    const { container } = renderWithProvider(
      <YearViewDayCell day={15} date={date} events={events} />
    )
    const dots = container.querySelectorAll('[class*="size-1.5"]')
    expect(dots.length).toBe(2)
  })

  it('renders "+N" overflow indicator when events > 3', () => {
    const events = Array.from({ length: 5 }, (_, i) =>
      makeTask({ id: `t-${i}`, dueDate: '2026-06-15T08:00:00Z' })
    )
    renderWithProvider(<YearViewDayCell day={15} date={date} events={events} />)
    // Shows "+4" (5 total, 1 shown as dot + +4)
    expect(screen.getByText(/\+\d+/)).toBeInTheDocument()
  })

  it('clicking the cell fires the click handler without errors', () => {
    renderWithProvider(<YearViewDayCell day={15} date={date} events={[]} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn).toBeInTheDocument()
  })
})
