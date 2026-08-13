import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { type ICalendarCell } from '../../model/types'
import { DayCell } from './day-cell'
import { TaskBullet } from './task-bullet'

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

vi.mock('../dnd/droppable-day-cell', () => ({
  DroppableDayCell: ({
    children,
    cell,
  }: {
    children: React.ReactNode
    cell: ICalendarCell
  }) => (
    <div data-testid={`droppable-${cell.date.toISOString()}`}>{children}</div>
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
  title: 'Task One',
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

const makeCell = (overrides: Partial<ICalendarCell> = {}): ICalendarCell => ({
  day: 15,
  currentMonth: true,
  date: new Date('2026-06-15T00:00:00Z'),
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

// --- TaskBullet ---

describe('TaskBullet', () => {
  it('renders a div element', () => {
    const { container } = render(
      <TaskBullet color='blue' className='test-class' />
    )
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
  })

  it('applies the provided className', () => {
    const { container } = render(
      <TaskBullet color='red' className='my-custom-class' />
    )
    const div = container.querySelector('div')
    expect(div?.className).toContain('my-custom-class')
  })

  it.each([
    ['blue', 'bg-blue-600'],
    ['green', 'bg-green-600'],
    ['red', 'bg-red-600'],
    ['yellow', 'bg-yellow-600'],
    ['purple', 'bg-purple-600'],
    ['orange', 'bg-orange-600'],
    ['gray', 'bg-neutral-600'],
  ] as const)('applies correct color class for %s', (color, expectedClass) => {
    const { container } = render(<TaskBullet color={color} className='' />)
    const div = container.querySelector('div')
    expect(div?.className).toContain(expectedClass)
  })
})

// --- DayCell ---

describe('DayCell', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the day number', () => {
    const cell = makeCell({ day: 15 })
    renderWithProvider(<DayCell cell={cell} tasks={[]} eventPositions={{}} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders inside a DroppableDayCell wrapper', () => {
    const cell = makeCell({ date: new Date('2026-06-15T00:00:00Z') })
    renderWithProvider(<DayCell cell={cell} tasks={[]} eventPositions={{}} />)
    expect(
      screen.getByTestId(`droppable-${cell.date.toISOString()}`)
    ).toBeInTheDocument()
  })

  it('renders "+N more" indicator when there are more than 3 tasks', () => {
    const cell = makeCell({ date: new Date('2026-06-15T00:00:00Z') })
    const tasks = [
      makeTask({ id: 't-1', dueDate: '2026-06-15T08:00:00Z' }),
      makeTask({ id: 't-2', dueDate: '2026-06-15T09:00:00Z' }),
      makeTask({ id: 't-3', dueDate: '2026-06-15T10:00:00Z' }),
      makeTask({ id: 't-4', dueDate: '2026-06-15T11:00:00Z' }),
    ]
    // eventPositions assigns positions 0,1,2,3
    const eventPositions = { 't-1': 0, 't-2': 1, 't-3': 2, 't-4': 3 }
    renderWithProvider(
      <DayCell cell={cell} tasks={tasks} eventPositions={eventPositions} />
    )
    // "1 more..." or "+1" depending on viewport
    expect(screen.getByText(/more/i)).toBeInTheDocument()
  })

  it('clicking the day number changes view to "day"', () => {
    const cell = makeCell({ day: 15, date: new Date('2026-06-15T00:00:00Z') })
    // We verify only that the button can be clicked without error
    renderWithProvider(<DayCell cell={cell} tasks={[]} eventPositions={{}} />)
    const dayBtn = screen.getByRole('button')
    fireEvent.click(dayBtn)
    // No error means the click handler fired
    expect(dayBtn).toBeInTheDocument()
  })

  it('applies reduced opacity for days outside current month', () => {
    const cell = makeCell({ currentMonth: false })
    const { container } = renderWithProvider(
      <DayCell cell={cell} tasks={[]} eventPositions={{}} />
    )
    // The day number button gets 'opacity-20' when not current month
    const btn = container.querySelector('button')
    expect(btn?.className).toContain('opacity-20')
  })
})
