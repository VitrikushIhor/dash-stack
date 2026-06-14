import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { type Task } from '../model/types'
import {
  calculateTaskProgress,
  isTaskOverdue,
  isTaskCompleted,
  getTaskEffectiveStart,
  getTaskCalendarAnchor,
  hasTaskDateRange,
} from './task-utils'

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

    it('should return false if dueDate is not set', () => {
      const task = {
        dueDate: undefined,
        completedAt: null,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(false)
    })

    it('should return true if dueDate is in the past and task is not completed', () => {
      const task = {
        dueDate: '2026-04-26T10:00:00Z',
        completedAt: null,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(true)
    })

    it('should return false if dueDate is in the past but task is completed', () => {
      const task = {
        dueDate: '2026-04-26T10:00:00Z',
        completedAt: '2026-04-26T10:30:00Z',
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(false)
    })

    it('should return false if dueDate is in the future', () => {
      const task = {
        dueDate: '2026-04-26T14:00:00Z',
        completedAt: null,
      } as unknown as Task
      expect(isTaskOverdue(task)).toBe(false)
    })
  })

  describe('isTaskCompleted', () => {
    it('returns true if completedAt is set', () => {
      const task = { completedAt: '2026-04-26T10:30:00Z' } as unknown as Task
      expect(isTaskCompleted(task)).toBe(true)
    })

    it('returns false if completedAt is null', () => {
      const task = { completedAt: null } as unknown as Task
      expect(isTaskCompleted(task)).toBe(false)
    })
  })

  describe('getTaskEffectiveStart', () => {
    it('returns startDate if present', () => {
      const task = {
        startDate: 'start',
        createdAt: 'create',
      } as unknown as Task
      expect(getTaskEffectiveStart(task)).toBe('start')
    })

    it('returns createdAt if startDate is missing', () => {
      const task = { startDate: null, createdAt: 'create' } as unknown as Task
      expect(getTaskEffectiveStart(task)).toBe('create')
    })
  })

  describe('getTaskCalendarAnchor', () => {
    it('returns dueDate if present', () => {
      const task = { dueDate: 'due', startDate: 'start' } as unknown as Task
      expect(getTaskCalendarAnchor(task)).toBe('due')
    })

    it('returns startDate if dueDate is missing', () => {
      const task = { dueDate: null, startDate: 'start' } as unknown as Task
      expect(getTaskCalendarAnchor(task)).toBe('start')
    })

    it('returns undefined if both are missing', () => {
      const task = { dueDate: null, startDate: null } as unknown as Task
      expect(getTaskCalendarAnchor(task)).toBeUndefined()
    })
  })

  describe('hasTaskDateRange', () => {
    it('returns true if both dates are present', () => {
      const task = { dueDate: 'due', startDate: 'start' } as unknown as Task
      expect(hasTaskDateRange(task)).toBe(true)
    })

    it('returns false if one or both are missing', () => {
      expect(
        hasTaskDateRange({
          dueDate: null,
          startDate: 'start',
        } as unknown as Task)
      ).toBe(false)
      expect(
        hasTaskDateRange({ dueDate: 'due', startDate: null } as unknown as Task)
      ).toBe(false)
      expect(
        hasTaskDateRange({ dueDate: null, startDate: null } as unknown as Task)
      ).toBe(false)
    })
  })
})
