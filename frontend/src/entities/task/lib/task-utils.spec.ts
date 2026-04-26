import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TaskStatusEnum, type Task } from '../model/types'
import { calculateTaskProgress, isTaskOverdue } from './task-utils'

describe('task-utils', () => {
  describe('calculateTaskProgress', () => {
    it('should return 0/0 if task has no checklists', () => {
      const task = { checklists: [] } as unknown as Task
      expect(calculateTaskProgress(task)).toEqual({
        totalItems: 0,
        completedItems: 0,
      })
    })

    it('should calculate progress correctly across multiple checklists', () => {
      const task = {
        checklists: [
          {
            items: [
              { id: '1', title: 'Item 1', completed: true },
              { id: '2', title: 'Item 2', completed: false },
            ],
          },
          {
            items: [{ id: '3', title: 'Item 3', completed: true }],
          },
        ],
      } as unknown as Task

      expect(calculateTaskProgress(task)).toEqual({
        totalItems: 3,
        completedItems: 2,
      })
    })

    it('should handle missing items in checklists', () => {
      const task = {
        checklists: [{ items: undefined }],
      } as unknown as Task
      expect(calculateTaskProgress(task)).toEqual({
        totalItems: 0,
        completedItems: 0,
      })
    })
  })

  describe('isTaskOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-26T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return false if deadline is not set', () => {
      const task = {
        deadline: undefined,
        status: TaskStatusEnum.PLANNED,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(false)
    })

    it('should return true if deadline is in the past and status is not COMPLETED', () => {
      const task = {
        deadline: '2026-04-26T10:00:00Z',
        status: TaskStatusEnum.UPCOMING,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(true)
    })

    it('should return false if deadline is in the past but status is COMPLETED', () => {
      const task = {
        deadline: '2026-04-26T10:00:00Z',
        status: TaskStatusEnum.COMPLETED,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(false)
    })

    it('should return false if deadline is in the future', () => {
      const task = {
        deadline: '2026-04-26T14:00:00Z',
        status: TaskStatusEnum.PLANNED,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(false)
    })
  })
})
