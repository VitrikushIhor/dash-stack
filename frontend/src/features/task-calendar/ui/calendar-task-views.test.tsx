import { format } from 'date-fns'
import { DndContext } from '@dnd-kit/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { type Task } from '@/entities/task'
import { CalendarAgendaView } from './agenda-view/calendar-agenda-view'
import { CalendarMonthView } from './month-view/calendar-month-view'
import { CalendarDayView } from './week-and-day-view/calendar-day-view'

vi.mock('../lib/navigation', () => ({
  useCalendarNavigation: () => ({
    navigateToDay: vi.fn(),
    navigateToMonth: vi.fn(),
  }),
}))

const selectedDate = new Date(2026, 9, 5)
const anchor = new Date(2026, 9, 5, 9, 30)
const task: Task = {
  id: 'task-1',
  title: 'Deadline',
  status: 'PLANNED',
  attachments: [],
  assignees: [],
  label: null,
  organizationId: 'org-1',
  createdAt: anchor.toISOString(),
  updatedAt: anchor.toISOString(),
  dueDate: anchor.toISOString(),
}

describe('calendar task views', () => {
  it('should_show_one_time_when_agenda_renders_a_single_point_task', () => {
    render(<CalendarAgendaView tasks={[task]} selectedDate={selectedDate} />)
    expect(screen.getByText(format(anchor, 'h:mm a'))).toBeInTheDocument()
    expect(screen.queryByText(/ - /)).not.toBeInTheDocument()
  })

  it('should_keep_first_three_tasks_and_overflow_count_when_a_month_day_is_full', () => {
    const tasks = Array.from({ length: 5 }, (_, index) => ({
      ...task,
      id: `task-${index}`,
      title: `Task ${index}`,
      dueDate: new Date(2026, 9, 5, 9 + index).toISOString(),
    })).reverse()
    render(
      <DndContext>
        <CalendarMonthView tasks={tasks} selectedDate={selectedDate} />
      </DndContext>
    )
    expect(screen.getByText('Task 0')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument()
    expect(screen.getByText('2 more...')).toBeInTheDocument()
  })

  it('should_show_only_the_selected_day_when_tasks_span_multiple_days', () => {
    const other = {
      ...task,
      id: 'other',
      title: 'Other day',
      dueDate: new Date(2026, 9, 6).toISOString(),
    }
    render(
      <DndContext>
        <CalendarDayView tasks={[other, task]} selectedDate={selectedDate} />
      </DndContext>
    )
    expect(screen.getByText('Deadline')).toBeInTheDocument()
    expect(screen.queryByText('Other day')).not.toBeInTheDocument()
  })
})
