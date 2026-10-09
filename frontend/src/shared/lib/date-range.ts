import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns'
import { type DateRange } from 'react-day-picker'

export function readFilterDate(value: unknown): Date | undefined {
  if (value instanceof Date) return isValid(value) ? value : undefined
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  if (typeof value === 'string' && !value.trim()) return undefined
  const numeric = Number(value)
  let date: Date | undefined
  if (Number.isFinite(numeric)) {
    date = new Date(numeric)
  } else if (typeof value === 'string') {
    date = parseISO(value)
  }
  return date && isValid(date) ? date : undefined
}

export function readFilterDateRange(value: unknown): DateRange | undefined {
  if (!Array.isArray(value) || value.length === 0 || value.length > 2)
    return undefined
  const from = readFilterDate(value[0])
  const to = readFilterDate(value[1])
  if (!from && !to) return undefined
  if (from && to && from > to) return undefined
  return { from, to }
}

export function serializeFilterDateRange(
  range: DateRange | undefined
): string[] | undefined {
  if (!range?.from) return undefined
  const from = startOfDay(range.from)
  if (!range.to) return [String(from.getTime())]
  return [String(from.getTime()), String(endOfDay(range.to).getTime())]
}
