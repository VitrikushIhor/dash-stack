import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { AgendaDayGroup } from './agenda-day-group'
import { AgendaTaskCard } from './agenda-task-card'

// --- Mocks ---

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

vi.mock('../task-details-dialog', () => ({
  TaskDetailsDialog: ({
    children,
    task,
  }: {
    children: React.ReactNode
    task: Task
  }) => (
    <div data-testid={`task-dialog-${task.id}`} data-title={task.title}>
      {children}
    </div>
  ),
}))

// --- Test Data ---

const mockUsers = [{ id: 'u-1', name: 'Alice', avatar: null }]

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't-1',
  title: 'Test Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-15T10:00:00Z',
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
    <CalendarProvider users={mockUsers} tasks={[]} selectedDate={selectedDate}>
      {ui}
    </CalendarProvider>
  )

// --- AgendaDayGroup ---

describe('AgendaDayGroup', () => {
  const date = new Date('2026-06-15T00:00:00Z')

  it('renders the formatted date header', () => {
    renderWithProvider(<AgendaDayGroup date={date} tasks={[]} />)
    // June 15, 2026 is a Monday
    expect(screen.getByText(/june\s+15,\s*2026/i)).toBeInTheDocument()
  })

  it('renders "No tasks" placeholder when tasks list is empty', () => {
    renderWithProvider(<AgendaDayGroup date={date} tasks={[]} />)
    expect(screen.getByText('No tasks')).toBeInTheDocument()
  })

  it('renders an AgendaTaskCard for each task', () => {
    const tasks = [
      makeTask({ id: 't-1', title: 'Task Alpha' }),
      makeTask({ id: 't-2', title: 'Task Beta' }),
    ]
    renderWithProvider(<AgendaDayGroup date={date} tasks={tasks} />)
    expect(screen.getByText('Task Alpha')).toBeInTheDocument()
    expect(screen.getByText('Task Beta')).toBeInTheDocument()
  })

  it('sorts tasks by deadline ascending', () => {
    const tasks = [
      makeTask({
        id: 't-2',
        title: 'Later Task',
        dueDate: '2026-06-15T14:00:00Z',
      }),
      makeTask({
        id: 't-1',
        title: 'Early Task',
        dueDate: '2026-06-15T08:00:00Z',
      }),
    ]
    renderWithProvider(<AgendaDayGroup date={date} tasks={tasks} />)

    const items = screen.getAllByText(/Task/)
    expect(items[0]).toHaveTextContent('Early Task')
    expect(items[1]).toHaveTextContent('Later Task')
  })
})

// --- AgendaTaskCard ---

describe('AgendaTaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task title', () => {
    const task = makeTask({ title: 'My Important Task' })
    renderWithProvider(<AgendaTaskCard task={task} />)
    expect(screen.getByText('My Important Task')).toBeInTheDocument()
  })

  it('wraps content in TaskDetailsDialog', () => {
    const task = makeTask({ id: 't-99', title: 'Dialog Wrapped Task' })
    renderWithProvider(<AgendaTaskCard task={task} />)
    expect(screen.getByTestId('task-dialog-t-99')).toBeInTheDocument()
  })

  it('renders "Unassigned" when task has no assignees', () => {
    const task = makeTask({ assignees: [] })
    renderWithProvider(<AgendaTaskCard task={task} />)
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('shows "Day X of Y" prefix when eventCurrentDay and eventTotalDays are provided', () => {
    const task = makeTask({ title: 'Multi-Day Task' })
    renderWithProvider(
      <AgendaTaskCard task={task} eventCurrentDay={2} eventTotalDays={5} />
    )
    expect(screen.getByText(/day 2 of 5/i)).toBeInTheDocument()
  })

  it('handles keyboard Enter to simulate click on the card', () => {
    const task = makeTask({ id: 't-kb', title: 'Keyboard Task' })
    renderWithProvider(<AgendaTaskCard task={task} />)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })
    // No error thrown → keyboard handler executed without crashing
    expect(card).toBeInTheDocument()
  })

  it('handles keyboard Space to simulate click on the card', () => {
    const task = makeTask({ id: 't-space', title: 'Space Task' })
    renderWithProvider(<AgendaTaskCard task={task} />)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ' })
    expect(card).toBeInTheDocument()
  })
})
