import { type ColumnFiltersState } from '@tanstack/react-table'
import { describe, it, expect } from 'vitest'
import {
  parseDateSafe,
  mapSearchParamsToColumnFilters,
  mapColumnFiltersToSearchParams,
} from './filters'

describe('tasks-table filters', () => {
  describe('parseDateSafe', () => {
    it('returns undefined for empty values', () => {
      expect(parseDateSafe(undefined)).toBeUndefined()
      expect(parseDateSafe('')).toBeUndefined()
    })

    it('parses valid numeric timestamps', () => {
      const timestamp = new Date('2024-01-01T00:00:00Z').getTime()
      expect(parseDateSafe(String(timestamp))).toBe('2024-01-01T00:00:00.000Z')
    })

    it('parses valid ISO date strings', () => {
      expect(parseDateSafe('2024-01-01T00:00:00.000Z')).toBe(
        '2024-01-01T00:00:00.000Z'
      )
    })

    it('returns undefined for invalid date strings', () => {
      expect(parseDateSafe('invalid-date')).toBeUndefined()
    })
  })

  describe('mapSearchParamsToColumnFilters', () => {
    it('returns empty array when no params provided', () => {
      const filters = mapSearchParamsToColumnFilters({
        status: [],
        labels: [],
        members: [],
        dueDate: [],
      })
      expect(filters).toEqual([])
    })

    it('maps string array parameters correctly', () => {
      const filters = mapSearchParamsToColumnFilters({
        status: ['IN_PROGRESS'],
        labels: ['bug', 'feature'],
        members: ['user-1'],
        dueDate: [],
      })

      expect(filters).toEqual([
        { id: 'status', value: ['IN_PROGRESS'] },
        { id: 'label', value: ['bug', 'feature'] },
        { id: 'assignees', value: ['user-1'] },
      ])
    })

    it('maps valid dueDate string arrays to Date objects', () => {
      const timestamp = new Date('2024-01-01T00:00:00Z').getTime()
      const filters = mapSearchParamsToColumnFilters({
        status: [],
        labels: [],
        members: [],
        dueDate: [String(timestamp), 'invalid-date'],
      })

      expect(filters).toHaveLength(1)
      expect(filters[0]?.id).toBe('dueDate')
      expect((filters[0]?.value as Date[])[0]).toBeInstanceOf(Date)
      expect((filters[0]?.value as Date[])[0]?.toISOString()).toBe(
        '2024-01-01T00:00:00.000Z'
      )
    })
  })

  describe('mapColumnFiltersToSearchParams', () => {
    it('returns null for empty filters', () => {
      const params = mapColumnFiltersToSearchParams([])
      expect(params).toEqual({
        status: null,
        labels: null,
        members: null,
        dueDate: null,
      })
    })

    it('maps column filters back to search params format', () => {
      const filters: ColumnFiltersState = [
        { id: 'status', value: ['DONE'] },
        { id: 'label', value: ['urgent'] },
        { id: 'assignees', value: ['user-2'] },
      ]

      const params = mapColumnFiltersToSearchParams(filters)

      expect(params).toEqual({
        status: ['DONE'],
        labels: ['urgent'],
        members: ['user-2'],
        dueDate: null,
      })
    })

    it('maps Date array correctly to string timestamps', () => {
      const date = new Date('2024-01-01T00:00:00.000Z')
      const filters: ColumnFiltersState = [{ id: 'dueDate', value: [date] }]

      const params = mapColumnFiltersToSearchParams(filters)

      expect(params.dueDate).toEqual([String(date.getTime())])
    })

    it('ignores invalid dates in dueDate filter', () => {
      const validDate = new Date('2024-01-01T00:00:00.000Z')
      const invalidDate = new Date('invalid')

      const filters: ColumnFiltersState = [
        { id: 'dueDate', value: [validDate, invalidDate] },
      ]

      const params = mapColumnFiltersToSearchParams(filters)
      expect(params.dueDate).toEqual([String(validDate.getTime())])
    })
  })
})
