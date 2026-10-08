import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { type Task } from '@/entities/task'
import { type TBadgeVariant as PublicBadgeVariant } from '../../index'
import { type TBadgeVariant } from '../../model/calendar-types'
import { YearViewDayCell } from './year-view-day-cell'

const { navigateToDay } = vi.hoisted(() => ({ navigateToDay: vi.fn() }))

vi.mock('../../lib/navigation', () => ({
  useCalendarNavigation: () => ({ navigateToDay }),
}))

const date = new Date(2026, 9, 5)
const task: Task = {
  id: 'task-1',
  title: 'Gray task',
  status: 'PLANNED',
  attachments: [],
  assignees: [],
  organizationId: 'org-1',
  createdAt: date.toISOString(),
  updatedAt: date.toISOString(),
  dueDate: date.toISOString(),
  label: { id: 'label-1', name: 'Gray', color: 'gray' },
}

describe('YearViewDayCell', () => {
  it('should_use_the_same_badge_contract_when_imported_from_the_public_api', () => {
    expectTypeOf<PublicBadgeVariant>().toEqualTypeOf<TBadgeVariant>()
  })

  it('should_keep_gray_indicator_visible_when_tasks_overflow', () => {
    const tasks = Array.from({ length: 4 }, (_, index) => ({
      ...task,
      id: `task-${index}`,
    }))
    const { container } = render(
      <YearViewDayCell day={5} date={date} tasks={tasks} />
    )

    expect(container.querySelector('.bg-neutral-600')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(navigateToDay).toHaveBeenCalledWith(date)
  })
})
