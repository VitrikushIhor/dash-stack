import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { KanbanViewMode } from '../model/types/kanban-types'
import { KanbanTaskBoard } from './kanban-task-board'

// --- Mocks ---

const mockUpdateTaskMutate = vi.fn()

vi.mock('@/entities/task', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/entities/task')>()
  return {
    ...original,
    useUpdateTask: () => ({
      mutate: mockUpdateTaskMutate,
    }),
  }
})

const mockActiveOrgId = { value: 'org-1' as string | null }

vi.mock('@/entities/organization', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/entities/organization')>()
  return {
    ...actual,
    useOrgStore: () => ({
      activeOrgId: mockActiveOrgId.value,
    }),
  }
})

const mockOpenCreate = vi.fn()
const mockOpenEdit = vi.fn()
const mockOpenDelete = vi.fn()

vi.mock('@/features/manage-task', () => ({
  useTaskModalStore: () => ({
    openCreate: mockOpenCreate,
    openEdit: mockOpenEdit,
    openDelete: mockOpenDelete,
  }),
}))

vi.mock('@/shared/ui', () => {
  return {
    Kanban: ({
      children,
      value,
      onValueChange,
      onDragStart,
      onDragEnd,
      onDragCancel,
      orientation,
    }: {
      children: React.ReactNode
      value: Record<string, Task[]>
      onValueChange?: (value: Record<string, Task[]>) => void
      onDragStart?: () => void
      onDragEnd?: () => void
      onDragCancel?: () => void
      orientation?: 'horizontal' | 'vertical'
    }) => (
      <div data-testid='kanban-root' data-orientation={orientation}>
        <button
          data-testid='trigger-drag-start'
          onClick={() => onDragStart?.()}
        >
          Drag Start
        </button>
        <button
          data-testid='trigger-value-change'
          onClick={() => {
            // Move task-1 from PLANNED to UPCOMING
            const newValue = { ...value }
            if (newValue.PLANNED) {
              newValue.PLANNED = newValue.PLANNED.filter(
                (t: Task) => t.id !== 'task-1'
              )
            }
            const movedTask = {
              id: 'task-1',
              title: 'Task 1',
              status: TaskStatusEnum.UPCOMING,
              dueDate: '2026-06-10T12:00:00Z',
              attachments: [],
              organizationId: 'org-1',
              createdAt: '2026-06-09T12:00:00Z',
              updatedAt: '2026-06-09T12:00:00Z',
              assignees: [],
              label: { id: 'l1', name: 'Low', color: 'blue' as const },
            }
            newValue.UPCOMING = [...(newValue.UPCOMING ?? []), movedTask]
            onValueChange?.(newValue)
          }}
        >
          Drag Move (task-1 to UPCOMING)
        </button>
        <button
          data-testid='trigger-value-change-reorder'
          onClick={() => {
            // Reorder within PLANNED (swap task-1 and task-2)
            const newValue = { ...value }
            if (newValue.PLANNED && newValue.PLANNED.length >= 2) {
              newValue.PLANNED = [newValue.PLANNED[1], newValue.PLANNED[0]]
            }
            onValueChange?.(newValue)
          }}
        >
          Drag Reorder (swap task-1 and task-2)
        </button>
        <button data-testid='trigger-drag-end' onClick={() => onDragEnd?.()}>
          Drag End
        </button>
        <button
          data-testid='trigger-drag-cancel'
          onClick={() => onDragCancel?.()}
        >
          Drag Cancel
        </button>
        {children}
      </div>
    ),
    KanbanBoard: ({
      children,
      className,
    }: {
      children: React.ReactNode
      className?: string
    }) => (
      <div data-testid='kanban-board' className={className}>
        {children}
      </div>
    ),
    KanbanColumn: ({
      children,
      value,
      className,
    }: {
      children: React.ReactNode
      value: string
      className?: string
    }) => (
      <div data-testid={`kanban-column-${value}`} className={className}>
        {children}
      </div>
    ),
    KanbanColumnHandle: ({ children }: { children: React.ReactNode }) => (
      <span data-testid='column-handle'>{children}</span>
    ),
    KanbanItem: ({
      children,
      value,
      ...props
    }: {
      children: React.ReactNode
      value: string
      [key: string]: unknown
    }) => (
      <div data-testid={`kanban-item-${value}`} {...props}>
        {children}
      </div>
    ),
    KanbanOverlay: () => null,
  }
})

vi.mock('@/features/task', () => ({
  TaskCard: ({
    task,
    onEdit,
    onDelete,
    onTaskClick,
  }: {
    task: Task
    onEdit?: (task: Task) => void
    onDelete?: (task: Task) => void
    onTaskClick?: () => void
  }) => (
    <div data-testid={`task-card-${task.id}`} onClick={onTaskClick}>
      <span>{task.title}</span>
      <button
        data-testid={`edit-task-${task.id}`}
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.(task)
        }}
      >
        Edit
      </button>
      <button
        data-testid={`delete-task-${task.id}`}
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.(task)
        }}
      >
        Delete
      </button>
    </div>
  ),
  TaskStatusBadge: () => null,
}))

vi.mock('@/shared/ui/core/accordion', () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='accordion-root'>{children}</div>
  ),
  AccordionItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => <div data-testid={`accordion-item-${value}`}>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='accordion-trigger'>{children}</div>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='accordion-content'>{children}</div>
  ),
}))

vi.mock('@/shared/ui/core/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='scroll-area'>{children}</div>
  ),
}))

// --- Test Data ---

const makeTask = (overrides: Partial<Task>): Task => ({
  id: 'task-default',
  title: 'Default Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-10T12:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '2026-06-09T12:00:00Z',
  updatedAt: '2026-06-09T12:00:00Z',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
  ...overrides,
})

const mockTasks: Task[] = [
  makeTask({ id: 'task-1', title: 'Task 1', status: TaskStatusEnum.PLANNED }),
  makeTask({
    id: 'task-2',
    title: 'Task 2',
    status: TaskStatusEnum.PLANNED,
    label: { id: 'l2', name: 'High', color: 'red' as const },
  }),
  makeTask({
    id: 'task-3',
    title: 'Task 3',
    status: TaskStatusEnum.UPCOMING,
    label: { id: 'l3', name: 'Medium', color: 'yellow' as const },
  }),
]

describe('KanbanTaskBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActiveOrgId.value = 'org-1'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders all columns and groups tasks correctly in Kanban mode', () => {
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      expect(screen.getByTestId('kanban-root')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-root')).toHaveAttribute(
        'data-orientation',
        'horizontal'
      )

      // Columns should exist
      expect(screen.getByTestId('kanban-column-PLANNED')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-column-UPCOMING')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-column-COMPLETED')).toBeInTheDocument()

      // Tasks should render in their appropriate columns
      const plannedColumn = screen.getByTestId('kanban-column-PLANNED')
      expect(plannedColumn).toHaveTextContent('Task 1')
      expect(plannedColumn).toHaveTextContent('Task 2')

      const upcomingColumn = screen.getByTestId('kanban-column-UPCOMING')
      expect(upcomingColumn).toHaveTextContent('Task 3')
    })

    it('renders correct task counters in headers', () => {
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      expect(screen.getByText('Planned')).toBeInTheDocument()
      expect(screen.getByText('2 open tasks')).toBeInTheDocument()

      expect(screen.getByText('Upcoming')).toBeInTheDocument()
      expect(screen.getByText('1 open task')).toBeInTheDocument()

      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('0 completed tasks')).toBeInTheDocument()
    })

    it('renders empty column placeholder when a column is empty', () => {
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      const completedColumn = screen.getByTestId('kanban-column-COMPLETED')
      expect(completedColumn).toHaveTextContent('No tasks in this column')
    })

    it('renders accordion columns in List mode', () => {
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.List} tasks={mockTasks} />
      )

      expect(screen.getByTestId('kanban-root')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-root')).toHaveAttribute(
        'data-orientation',
        'vertical'
      )

      expect(screen.getAllByTestId('accordion-root')).toHaveLength(3)

      // Columns should exist
      expect(screen.getByTestId('kanban-column-PLANNED')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-column-UPCOMING')).toBeInTheDocument()
      expect(screen.getByTestId('kanban-column-COMPLETED')).toBeInTheDocument()
    })
  })

  describe('Props Synchronization', () => {
    it('synchronizes internal columns state when tasks prop changes', () => {
      const { rerender } = render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      expect(screen.getByText('Planned')).toBeInTheDocument()
      expect(screen.getByText('2 open tasks')).toBeInTheDocument()

      const newTasks: Task[] = [
        ...mockTasks,
        {
          id: 'task-4',
          title: 'Task 4',
          status: TaskStatusEnum.COMPLETED,
          dueDate: '2026-06-13T12:00:00Z',
          attachments: [],
          organizationId: 'org-1',
          createdAt: '2026-06-09T12:00:00Z',
          updatedAt: '2026-06-09T12:00:00Z',
          assignees: [],
          label: { id: 'l4', name: 'Low', color: 'blue' as const },
        },
      ]

      rerender(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={newTasks} />
      )

      expect(screen.getByText('1 completed task')).toBeInTheDocument()
      const completedColumn = screen.getByTestId('kanban-column-COMPLETED')
      expect(completedColumn).toHaveTextContent('Task 4')
      expect(completedColumn).not.toHaveTextContent('No tasks in this column')
    })
  })

  describe('Task Action Handlers', () => {
    it('triggers openCreate with correct status when clicking Create Task button', async () => {
      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      // Find the Create Task button in the Planned column
      const plannedColumn = screen.getByTestId('kanban-column-PLANNED')
      const plannedCreateBtn = within(plannedColumn).getByRole('button', {
        name: /create task/i,
      })

      await user.click(plannedCreateBtn)

      expect(mockOpenCreate).toHaveBeenCalledTimes(1)
      expect(mockOpenCreate).toHaveBeenCalledWith({
        status: TaskStatusEnum.PLANNED,
      })
    })

    it('triggers openEdit when clicking edit on Task Card', async () => {
      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      const editBtn = screen.getByTestId('edit-task-task-1')
      await user.click(editBtn)

      expect(mockOpenEdit).toHaveBeenCalledTimes(1)
      expect(mockOpenEdit).toHaveBeenCalledWith(mockTasks[0])
    })

    it('triggers openDelete when clicking delete on Task Card', async () => {
      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      const deleteBtn = screen.getByTestId('delete-task-task-2')
      await user.click(deleteBtn)

      expect(mockOpenDelete).toHaveBeenCalledTimes(1)
      expect(mockOpenDelete).toHaveBeenCalledWith(mockTasks[1])
    })
  })

  describe('Drag and Drop Lifecycle', () => {
    it('successfully calls updateTask mutation when dragging a task to another column', async () => {
      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      // 1. Simulate Drag Start
      await user.click(screen.getByTestId('trigger-drag-start'))

      // 2. Simulate moving task-1 to UPCOMING column (triggers local state change)
      await user.click(screen.getByTestId('trigger-value-change'))

      // Confirm local state updated visually in UI before drag end
      const plannedColumn = screen.getByTestId('kanban-column-PLANNED')
      const upcomingColumn = screen.getByTestId('kanban-column-UPCOMING')
      expect(plannedColumn).not.toHaveTextContent('Task 1')
      expect(upcomingColumn).toHaveTextContent('Task 1')

      // 3. Simulate Drag End
      await user.click(screen.getByTestId('trigger-drag-end'))

      // Check mutation call details
      expect(mockUpdateTaskMutate).toHaveBeenCalledTimes(1)
      expect(mockUpdateTaskMutate).toHaveBeenCalledWith({
        id: 'task-1',
        data: { status: TaskStatusEnum.UPCOMING },
      })
    })

    it('reverts to the initial layout on drag cancellation without calling mutation', async () => {
      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      // 1. Drag Start
      await user.click(screen.getByTestId('trigger-drag-start'))

      // 2. Move task-1 to UPCOMING
      await user.click(screen.getByTestId('trigger-value-change'))

      // 3. Cancel Drag
      await user.click(screen.getByTestId('trigger-drag-cancel'))

      // State should revert to original
      const plannedColumn = screen.getByTestId('kanban-column-PLANNED')
      expect(plannedColumn).toHaveTextContent('Task 1')
      expect(plannedColumn).toHaveTextContent('Task 2')

      const upcomingColumn = screen.getByTestId('kanban-column-UPCOMING')
      expect(upcomingColumn).not.toHaveTextContent('Task 1')

      // No mutation should be triggered
      expect(mockUpdateTaskMutate).not.toHaveBeenCalled()
    })

    it('does not trigger mutation if a task is reordered within the same column', async () => {
      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      // 1. Drag Start
      await user.click(screen.getByTestId('trigger-drag-start'))

      // 2. Reorder within Planned (swap task-1 and task-2)
      await user.click(screen.getByTestId('trigger-value-change-reorder'))

      // 3. Drag End
      await user.click(screen.getByTestId('trigger-drag-end'))

      // Reordering within the same column should not trigger updateTask mutation (since status did not change)
      expect(mockUpdateTaskMutate).not.toHaveBeenCalled()
    })

    it('does not call updateTask if activeOrgId is not set', async () => {
      mockActiveOrgId.value = null // Simulates missing organization context

      const user = userEvent.setup()
      render(
        <KanbanTaskBoard viewMode={KanbanViewMode.Kanban} tasks={mockTasks} />
      )

      // 1. Drag Start
      await user.click(screen.getByTestId('trigger-drag-start'))

      // 2. Move task-1 to UPCOMING
      await user.click(screen.getByTestId('trigger-value-change'))

      // 3. Drag End
      await user.click(screen.getByTestId('trigger-drag-end'))

      // Since activeOrgId was null, handleTaskMove returns early without mutating
      expect(mockUpdateTaskMutate).not.toHaveBeenCalled()
    })
  })
})
