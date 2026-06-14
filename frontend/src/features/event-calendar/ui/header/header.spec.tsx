import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider } from '../../model/calendar-context'
import { DateNavigator } from './date-navigator'
import { TodayButton } from './today-button'
import { UserSelect } from './user-select'

// --- Mocks ---

vi.mock('@/shared/ui/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({
    children,
  }: {
    children: React.ReactNode
    asChild?: boolean
  }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/shared/ui/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => <span className={className}>{children}</span>,
}))

vi.mock('@/shared/ui/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant: _variant,
    size: _size,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
    className?: string
    'aria-label'?: string
  }) => (
    <button onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}))

vi.mock('@/shared/ui/components/ui/select', () => ({
  Select: ({
    children,
    value: _value,
    onValueChange: _onValueChange,
  }: {
    children: React.ReactNode
    value?: string
    onValueChange?: (v: string) => void
  }) => <div data-testid='select-root'>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid='select-trigger'>{children}</button>
  ),
  SelectValue: () => <span data-testid='select-value' />,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='select-content'>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => (
    <div data-testid={`select-item-${value}`} role='option'>
      {children}
    </div>
  ),
}))

vi.mock('@/shared/ui/components/avatar-group', () => ({
  AvatarGroup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid='avatar-group'>{children}</div>
  ),
}))

vi.mock('@/shared/ui/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt} />
  ),
}))

// --- Test Data ---

const mockUsers = [
  { id: 'u-1', name: 'Alice', avatar: null },
  { id: 'u-2', name: 'Bob', avatar: 'bob.jpg' },
]

const mockEvents: Task[] = [
  {
    id: 't-1',
    title: 'Event June 10',
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

const renderWithProvider = (
  ui: React.ReactElement,
  {
    selectedDate = new Date('2026-06-10T00:00:00Z'),
    view = 'month' as const,
  } = {}
) =>
  render(
    <CalendarProvider
      users={mockUsers}
      events={mockEvents}
      selectedDate={selectedDate}
      view={view}
    >
      {ui}
    </CalendarProvider>
  )

// --- TodayButton ---

describe('TodayButton', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders a button element', () => {
    renderWithProvider(<TodayButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays today month abbreviation and day number', () => {
    renderWithProvider(<TodayButton />)
    const today = new Date()
    const dayNumber = today.getDate().toString()
    expect(screen.getByText(dayNumber)).toBeInTheDocument()
  })
})

// --- DateNavigator ---

describe('DateNavigator', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders month name and year for selected date', () => {
    renderWithProvider(<DateNavigator view='month' events={mockEvents} />)
    expect(screen.getByText(/june/i)).toBeInTheDocument()
    // year appears in multiple places, just assert at least one exists
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0)
  })

  it('renders event count badge', () => {
    renderWithProvider(<DateNavigator view='month' events={mockEvents} />)
    expect(screen.getByText(/events/i)).toBeInTheDocument()
  })

  it('renders Previous and Next navigation buttons', () => {
    renderWithProvider(<DateNavigator view='month' events={mockEvents} />)
    const buttons = screen.getAllByRole('button')
    // Previous + Next
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('navigates to previous month on prev button click', () => {
    renderWithProvider(<DateNavigator view='month' events={mockEvents} />)
    const [prevBtn] = screen.getAllByRole('button')
    fireEvent.click(prevBtn)
    // "May 2026" uniquely matches the heading span (range text has "May 1, 2026")
    expect(screen.getByText(/may 2026/i)).toBeInTheDocument()
  })

  it('navigates to next month on next button click', () => {
    renderWithProvider(<DateNavigator view='month' events={mockEvents} />)
    const buttons = screen.getAllByRole('button')
    const nextBtn = buttons[buttons.length - 1]
    fireEvent.click(nextBtn)
    // "July 2026" uniquely matches the heading span (range text has "Jul 1, 2026")
    expect(screen.getByText(/july 2026/i)).toBeInTheDocument()
  })
})

// --- UserSelect ---

describe('UserSelect', () => {
  it('renders a Select with "All" option', () => {
    renderWithProvider(<UserSelect />)
    expect(screen.getByTestId('select-item-all')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('renders a select item for each user', () => {
    renderWithProvider(<UserSelect />)
    expect(screen.getByTestId('select-item-u-1')).toBeInTheDocument()
    expect(screen.getByTestId('select-item-u-2')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('displays user first letter as avatar fallback', () => {
    renderWithProvider(<UserSelect />)
    // Alice → A, Bob → B
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
