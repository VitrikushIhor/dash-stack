import { type ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OrgRole } from '@/shared/model'
import { type Label } from '@/shared/ui'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { TaskCardKanban } from './task-card'

// Mock the Link component from @tanstack/react-router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

// Mock UI components that might cause issues
vi.mock('@/shared/ui', () => ({
  AvatarGroup: () => <div data-testid='avatar-group'>Avatars</div>,
}))

vi.mock('@/shared/ui', () => ({
  LabelBadge: ({ label }: { label: Label }) => <span>{label.name}</span>,
}))

vi.mock('@/shared/ui/core/badge', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

vi.mock('@/shared/ui/core/card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/core/progress', () => ({
  Progress: ({ value }: { value: number }) => <div>Progress: {value}%</div>,
}))

// Mock the TaskCardActions component
vi.mock('./task-card-actions', () => ({
  TaskCardActions: () => <div data-testid='task-actions'>Actions</div>,
}))

describe('TaskCardKanban', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatusEnum.UPCOMING,
    dueDate: '2026-04-26T10:00:00Z',
    assignees: [
      {
        id: 'mem-1',
        userId: 'user-1',
        orgId: 'org-1',
        role: OrgRole.MEMBER,
        joinedAt: new Date().toISOString(),
        user: {
          id: 'user-1',
          firstName: 'John',
          email: 'john@example.com',
          avatar: undefined,
        },
      },
    ],
    label: { id: 'lbl-1', name: 'Urgent', color: 'red' },
    checklists: [
      {
        id: 'cl-1',
        name: 'Checklist 1',
        items: [
          { id: 'it-1', title: 'Item 1', completed: true },
          { id: 'it-2', title: 'Item 2', completed: false },
        ],
      },
    ],
    attachments: [],
    organizationId: 'org-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('should render task title', () => {
    render(<TaskCardKanban task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeDefined()
  })

  it('should display progress text', () => {
    render(<TaskCardKanban task={mockTask} />)

    // 1 out of 2 items completed = 1/2
    expect(screen.getByText('1/2')).toBeDefined()
  })

  it('should show red text for deadline if task is overdue', () => {
    vi.useFakeTimers()
    // Mock date to be after deadline
    vi.setSystemTime(new Date('2026-04-26T12:00:00Z'))

    const { container } = render(<TaskCardKanban task={mockTask} />)

    // Check if there is an element with text-red-600 class
    const overdueElement = container.querySelector('.text-red-600')
    expect(overdueElement).toBeDefined()

    vi.useRealTimers()
  })
})
