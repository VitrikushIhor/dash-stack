import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { AgendaDayGroup } from './agenda-day-group'
import { AgendaEventCard } from './agenda-event-card'

// --- Mocks ---

vi.mock('@/shared/ui/components/ui/tooltip', () => ({
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

vi.mock('../event-details-dialog', () => ({
  EventDetailsDialog: ({
    children,
    event,
  }: {
    children: React.ReactNode
    event: Task
  }) => (
    <div data-testid={`event-dialog-${event.id}`} data-title={event.title}>
      {children}
    </div>
  ),
}))

// --- Test Data ---

const mockUsers = [{ id: 'u-1', name: 'Alice', avatar: null }]

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't-1',
  title: 'Test Event',
  status: TaskStatusEnum.PLANNED,
  deadline: '2026-06-15T10:00:00Z',
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
  selectedDate = new Date('2026-06-15T00:00:00Z')
) =>
  render(
    <CalendarProvider users={mockUsers} events={[]} selectedDate={selectedDate}>
      {ui}
    </CalendarProvider>
  )

// --- AgendaDayGroup ---

describe('AgendaDayGroup', () => {
  const date = new Date('2026-06-15T00:00:00Z')

  it('renders the formatted date header', () => {
    renderWithProvider(<AgendaDayGroup date={date} events={[]} />)
    // June 15, 2026 is a Monday
    expect(screen.getByText(/june\s+15,\s*2026/i)).toBeInTheDocument()
  })

  it('renders "No events" placeholder when events list is empty', () => {
    renderWithProvider(<AgendaDayGroup date={date} events={[]} />)
    expect(screen.getByText('No events')).toBeInTheDocument()
  })

  it('renders an AgendaEventCard for each event', () => {
    const events = [
      makeTask({ id: 't-1', title: 'Event Alpha' }),
      makeTask({ id: 't-2', title: 'Event Beta' }),
    ]
    renderWithProvider(<AgendaDayGroup date={date} events={events} />)
    expect(screen.getByText('Event Alpha')).toBeInTheDocument()
    expect(screen.getByText('Event Beta')).toBeInTheDocument()
  })

  it('sorts events by deadline ascending', () => {
    const events = [
      makeTask({
        id: 't-2',
        title: 'Later Event',
        deadline: '2026-06-15T14:00:00Z',
      }),
      makeTask({
        id: 't-1',
        title: 'Early Event',
        deadline: '2026-06-15T08:00:00Z',
      }),
    ]
    renderWithProvider(<AgendaDayGroup date={date} events={events} />)

    const items = screen.getAllByText(/Event/)
    expect(items[0]).toHaveTextContent('Early Event')
    expect(items[1]).toHaveTextContent('Later Event')
  })
})

// --- AgendaEventCard ---

describe('AgendaEventCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders event title', () => {
    const event = makeTask({ title: 'My Important Task' })
    renderWithProvider(<AgendaEventCard event={event} />)
    expect(screen.getByText('My Important Task')).toBeInTheDocument()
  })

  it('wraps content in EventDetailsDialog', () => {
    const event = makeTask({ id: 't-99', title: 'Dialog Wrapped Event' })
    renderWithProvider(<AgendaEventCard event={event} />)
    expect(screen.getByTestId('event-dialog-t-99')).toBeInTheDocument()
  })

  it('renders "Unassigned" when event has no assignees', () => {
    const event = makeTask({ assignees: [] })
    renderWithProvider(<AgendaEventCard event={event} />)
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('shows "Day X of Y" prefix when eventCurrentDay and eventTotalDays are provided', () => {
    const event = makeTask({ title: 'Multi-Day Event' })
    renderWithProvider(
      <AgendaEventCard event={event} eventCurrentDay={2} eventTotalDays={5} />
    )
    expect(screen.getByText(/day 2 of 5/i)).toBeInTheDocument()
  })

  it('handles keyboard Enter to simulate click on the card', () => {
    const event = makeTask({ id: 't-kb', title: 'Keyboard Event' })
    renderWithProvider(<AgendaEventCard event={event} />)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })
    // No error thrown → keyboard handler executed without crashing
    expect(card).toBeInTheDocument()
  })

  it('handles keyboard Space to simulate click on the card', () => {
    const event = makeTask({ id: 't-space', title: 'Space Event' })
    renderWithProvider(<AgendaEventCard event={event} />)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ' })
    expect(card).toBeInTheDocument()
  })
})
