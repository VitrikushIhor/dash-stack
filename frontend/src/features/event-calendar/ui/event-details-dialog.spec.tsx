import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { EventDetailsDialog } from './event-details-dialog'

// --- Mocks ---

const mockOpenEdit = vi.fn()

vi.mock('@/features/manage-task', () => ({
  useTaskModalStore: () => ({
    openEdit: mockOpenEdit,
  }),
}))

vi.mock('@/shared/ui/core/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    variant: _variant,
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: string
    variant?: string
  }) => (
    <button type={type as 'button' | 'submit' | 'reset'} onClick={onClick}>
      {children}
    </button>
  ),
}))

vi.mock('@/shared/ui/core/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog'>{children}</div>
  ),
  DialogTrigger: ({
    children,
    asChild: _asChild,
  }: {
    children: React.ReactNode
    asChild?: boolean
  }) => <div data-testid='dialog-trigger'>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-content'>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-header'>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid='dialog-title'>{children}</h2>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dialog-footer'>{children}</div>
  ),
}))

vi.mock('@/features/event-calendar/lib/mappers', () => ({
  getTaskUser: () => ({ id: 'u-1', name: 'Bob', avatar: null }),
}))

// --- Test Data ---

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't-1',
  title: 'My Event',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-15T14:30:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
  description: 'Event description text',
  ...overrides,
})

const renderWithProvider = (ui: React.ReactElement) => render(ui)

// --- EventDetailsDialog ---

describe('EventDetailsDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders children inside the dialog trigger', () => {
    const event = makeTask()
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <button>Open Details</button>
      </EventDetailsDialog>
    )
    expect(screen.getByText('Open Details')).toBeInTheDocument()
  })

  it('renders the event title in the dialog header', () => {
    const event = makeTask({ title: 'Project Launch' })
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <span>trigger</span>
      </EventDetailsDialog>
    )
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Project Launch'
    )
  })

  it('renders the responsible user name', () => {
    const event = makeTask()
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <span>trigger</span>
      </EventDetailsDialog>
    )
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders formatted start and end dates from the.dueDate', () => {
    const event = makeTask({ dueDate: '2026-06-15T14:30:00Z' })
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <span>trigger</span>
      </EventDetailsDialog>
    )
    // "Jun 15, 2026 2:30 PM"
    expect(screen.getAllByText(/jun 15, 2026/i).length).toBeGreaterThan(0)
  })

  it('renders the event description', () => {
    const event = makeTask({ description: 'Very important meeting' })
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <span>trigger</span>
      </EventDetailsDialog>
    )
    expect(screen.getByText('Very important meeting')).toBeInTheDocument()
  })

  it('calls openEdit with the event when Edit button is clicked', () => {
    const event = makeTask({ id: 't-edit', title: 'Editable Event' })
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <span>trigger</span>
      </EventDetailsDialog>
    )
    const editBtn = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editBtn)
    expect(mockOpenEdit).toHaveBeenCalledOnce()
    expect(mockOpenEdit).toHaveBeenCalledWith(event)
  })

  it('renders the "Responsible" and "Start Date" section labels', () => {
    const event = makeTask()
    renderWithProvider(
      <EventDetailsDialog event={event}>
        <span>trigger</span>
      </EventDetailsDialog>
    )
    expect(screen.getByText('Responsible')).toBeInTheDocument()
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
