import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { type Task } from '@/entities/task'
import {
  buildCalendarTaskIndex,
  getCalendarDayTasks,
} from './calendar-task-index'

function task(id: string, dates: Pick<Task, 'dueDate' | 'startDate'>): Task {
  return {
    id,
    title: id,
    status: 'PLANNED',
    attachments: [],
    assignees: [],
    label: null,
    organizationId: 'org-1',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    ...dates,
  }
}

describe('calendar task index', () => {
  it('should_group_sorted_tasks_by_local_day_when_dates_cross_month_boundaries', () => {
    const day = new Date(2026, 9, 5)
    const early = new Date(2026, 9, 5, 9).toISOString()
    const late = new Date(2026, 9, 5, 15).toISOString()
    const nextMonth = new Date(2026, 10, 1).toISOString()
    const tasks = [
      task('late', { dueDate: late }),
      task('next', { dueDate: nextMonth }),
      task('early', { startDate: early }),
      task('hidden', {}),
    ]

    const index = buildCalendarTaskIndex(tasks)

    expect(getCalendarDayTasks(index, day).map((item) => item.id)).toEqual([
      'early',
      'late',
    ])
    expect(
      getCalendarDayTasks(index, new Date(2026, 10, 1)).map((item) => item.id)
    ).toEqual(['next'])
    expect(getCalendarDayTasks(index, new Date(2026, 9, 6))).toEqual([])
    expect([...index.keys()]).toEqual([format(day, 'yyyy-MM-dd'), '2026-11-01'])
    expect(tasks.map((item) => item.id)).toEqual([
      'late',
      'next',
      'early',
      'hidden',
    ])
  })

  it('should_prefer_due_date_when_both_markers_are_present', () => {
    const startDate = new Date(2026, 9, 1).toISOString()
    const dueDate = new Date(2026, 9, 5).toISOString()

    const index = buildCalendarTaskIndex([
      task('range', { startDate, dueDate }),
    ])

    expect(getCalendarDayTasks(index, new Date(2026, 9, 1))).toEqual([])
    expect(getCalendarDayTasks(index, new Date(2026, 9, 5))).toHaveLength(1)
  })

  it('should_fail_explicitly_when_an_anchor_is_invalid', () => {
    expect(() =>
      buildCalendarTaskIndex([task('invalid', { dueDate: 'invalid' })])
    ).toThrow(RangeError)
  })
})
