import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { CalendarProvider, useCalendar } from './calendar-context'
import { type IUser } from './types'

const mockUsers: IUser[] = [
  { id: 'u-1', name: 'User 1', avatar: null },
  { id: 'u-2', name: 'User 2', avatar: 'avatar.jpg' },
]

const mockEvents: Task[] = [
  {
    id: 't-1',
    title: 'Event 1',
    status: TaskStatusEnum.PLANNED,
    dueDate: '2026-06-10T12:00:00Z',
    attachments: [],
    organizationId: 'org-1',
    createdAt: '2026-06-09T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
    assignees: [],
    label: { id: 'l1', name: 'Low', color: 'blue' as const },
  },
]

describe('CalendarContext', () => {
  it('returns empty object when useCalendar is used outside of CalendarProvider', () => {
    const { result } = renderHook(() => useCalendar())
    expect(result.current).toEqual({})
  })
  it('provides default state values in context', () => {
    const testDate = new Date('2026-06-10T12:00:00Z')
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalendarProvider
        users={mockUsers}
        events={mockEvents}
        view='month'
        selectedDate={testDate}
      >
        {children}
      </CalendarProvider>
    )

    const { result } = renderHook(() => useCalendar(), { wrapper })

    expect(result.current.users).toEqual(mockUsers)
    expect(result.current.events).toEqual(mockEvents)
    expect(result.current.view).toBe('month')
    expect(result.current.selectedDate).toEqual(testDate)
    expect(result.current.selectedUserId).toBe('all')
    expect(result.current.badgeVariant).toBe('colored')
  })

  it('updates selectedDate correctly when setSelectedDate is called', () => {
    const testDate = new Date('2026-06-10T12:00:00Z')
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalendarProvider
        users={mockUsers}
        events={mockEvents}
        selectedDate={testDate}
      >
        {children}
      </CalendarProvider>
    )

    const { result } = renderHook(() => useCalendar(), { wrapper })

    const newDate = new Date('2026-06-15T00:00:00Z')
    act(() => {
      result.current.setSelectedDate(newDate)
    })

    expect(result.current.selectedDate).toEqual(newDate)
  })

  it('ignores undefined values passed to setSelectedDate', () => {
    const testDate = new Date('2026-06-10T12:00:00Z')
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalendarProvider
        users={mockUsers}
        events={mockEvents}
        selectedDate={testDate}
      >
        {children}
      </CalendarProvider>
    )

    const { result } = renderHook(() => useCalendar(), { wrapper })

    act(() => {
      result.current.setSelectedDate(undefined)
    })

    expect(result.current.selectedDate).toEqual(testDate)
  })

  it('updates selectedUserId correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalendarProvider users={mockUsers} events={mockEvents}>
        {children}
      </CalendarProvider>
    )

    const { result } = renderHook(() => useCalendar(), { wrapper })

    act(() => {
      result.current.setSelectedUserId('u-2')
    })
    expect(result.current.selectedUserId).toBe('u-2')

    act(() => {
      result.current.setSelectedUserId('all')
    })
    expect(result.current.selectedUserId).toBe('all')
  })

  it('updates badgeVariant correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalendarProvider users={mockUsers} events={mockEvents}>
        {children}
      </CalendarProvider>
    )

    const { result } = renderHook(() => useCalendar(), { wrapper })

    act(() => {
      result.current.setBadgeVariant('dot')
    })
    expect(result.current.badgeVariant).toBe('dot')

    act(() => {
      result.current.setBadgeVariant('mixed')
    })
    expect(result.current.badgeVariant).toBe('mixed')
  })

  it('updates view correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CalendarProvider users={mockUsers} events={mockEvents}>
        {children}
      </CalendarProvider>
    )

    const { result } = renderHook(() => useCalendar(), { wrapper })

    act(() => {
      result.current.setView('week')
    })
    expect(result.current.view).toBe('week')

    act(() => {
      result.current.setView('agenda')
    })
    expect(result.current.view).toBe('agenda')
  })
})
