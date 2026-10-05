import { describe, expect, it } from 'vitest'
import { type Task } from '@/entities/task'
import {
  getCalendarTaskDateUpdate,
  readCalendarDayDropData,
  readCalendarTaskDragData,
} from './calendar-task-move'

const date = new Date(2026, 9, 24, 9, 30, 12, 123)
const task: Task = {
  id: 'task-1',
  title: 'Deadline',
  status: 'PLANNED',
  attachments: [],
  assignees: [],
  label: null,
  organizationId: 'org-1',
  createdAt: date.toISOString(),
  updatedAt: date.toISOString(),
  startDate: date.toISOString(),
}

describe('calendar task move', () => {
  it('should_preserve_wall_clock_time_when_moving_a_start_only_task_across_dst', () => {
    const target = new Date(2026, 9, 26)
    const result = getCalendarTaskDateUpdate(task, {
      type: 'day',
      date: target,
    })
    expect(result).toEqual({
      dueDate: new Date(2026, 9, 26, 9, 30, 12, 123).toISOString(),
    })
    expect(task.dueDate).toBeUndefined()
    expect(target.getHours()).toBe(0)
  })

  it('should_return_no_update_when_the_deadline_is_unchanged_or_task_has_no_anchor', () => {
    expect(
      getCalendarTaskDateUpdate(
        { ...task, dueDate: date.toISOString() },
        { type: 'day', date }
      )
    ).toBeNull()
    expect(
      getCalendarTaskDateUpdate(
        { ...task, startDate: null },
        { type: 'day', date }
      )
    ).toBeNull()
  })

  it('should_reject_untrusted_metadata_when_drag_or_drop_payload_is_invalid', () => {
    expect(readCalendarTaskDragData({ type: 'task', taskId: task.id })).toEqual(
      { type: 'task', taskId: task.id }
    )
    expect(readCalendarTaskDragData({ type: 'task', task: {} })).toBeNull()
    expect(readCalendarTaskDragData({ type: 'task', taskId: 42 })).toBeNull()
    expect(readCalendarDayDropData({ type: 'day', date })).toEqual({
      type: 'day',
      date,
    })
    expect(
      readCalendarDayDropData({ type: 'day', date: new Date('invalid') })
    ).toBeNull()
    expect(
      readCalendarDayDropData({ type: 'day', date: '2026-10-05' })
    ).toBeNull()
    expect(
      readCalendarDayDropData({ type: 'time-block', date, hour: 9, minute: 30 })
    ).toBeNull()
  })
})
