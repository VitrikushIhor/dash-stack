import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  eachDayOfInterval,
  startOfDay,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
} from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { type TCalendarView } from '../model/calendar-types'
import { type ICalendarCell } from '../model/types'

// ================ Header helper functions ================ //

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function rangeText(view: TCalendarView, date: Date) {
  const formatString = 'MMM d, yyyy'
  let start: Date
  let end: Date

  switch (view) {
    case 'agenda':
      start = startOfMonth(date)
      end = endOfMonth(date)
      break
    case 'year':
      start = startOfYear(date)
      end = endOfYear(date)
      break
    case 'month':
      start = startOfMonth(date)
      end = endOfMonth(date)
      break
    case 'week':
      start = startOfWeek(date)
      end = endOfWeek(date)
      break
    case 'day':
      return format(date, formatString)
    default:
      return 'Error while formatting '
  }

  return `${format(start, formatString)} - ${format(end, formatString)}`
}

export function navigateDate(
  date: Date,
  view: TCalendarView,
  direction: 'previous' | 'next'
): Date {
  const operations = {
    agenda: direction === 'next' ? addMonths : subMonths,
    year: direction === 'next' ? addYears : subYears,
    month: direction === 'next' ? addMonths : subMonths,
    week: direction === 'next' ? addWeeks : subWeeks,
    day: direction === 'next' ? addDays : subDays,
  }

  return operations[view](date, 1)
}

export function getEventsCount(
  tasks: Task[],
  date: Date,
  view: TCalendarView
): number {
  const compareFns = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
  }

  return tasks.filter((task) => {
    const anchor = getTaskCalendarAnchor(task)
    return anchor && compareFns[view](new Date(anchor), date)
  }).length
}

// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear()
  const currentMonth = selectedDate.getMonth()

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1)
  const totalDays = firstDayOfMonth + daysInMonth

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(
      currentYear,
      currentMonth - 1,
      daysInPrevMonth - firstDayOfMonth + i + 1
    ),
  }))

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }))

  const nextMonthCells = Array.from(
    { length: (7 - (totalDays % 7)) % 7 },
    (_, i) => ({
      day: i + 1,
      currentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i + 1),
    })
  )

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells]
}

export function calculateMonthEventPositions(
  singleDayTasks: Task[],
  selectedDate: Date
) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)

  const eventPositions: { [key: string]: number } = {}
  const occupiedPositions: { [key: string]: boolean[] } = {}

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
    occupiedPositions[day.toISOString()] = [false, false, false]
  })

  const sortedEvents = [...singleDayTasks]
  sortedEvents.sort((a, b) => {
    const anchorA = getTaskCalendarAnchor(a)
    const anchorB = getTaskCalendarAnchor(b)
    if (!anchorA || !anchorB) return 0
    return parseISO(anchorA).getTime() - parseISO(anchorB).getTime()
  })

  sortedEvents.forEach((task) => {
    const anchor = getTaskCalendarAnchor(task)
    if (!anchor) return
    const eventStart = parseISO(anchor)
    const eventEnd = parseISO(anchor)
    const eventDays = eachDayOfInterval({
      start: eventStart < monthStart ? monthStart : eventStart,
      end: eventEnd > monthEnd ? monthEnd : eventEnd,
    })

    let position = -1

    for (let i = 0; i < 3; i++) {
      if (
        eventDays.every((day) => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()]
          return dayPositions && !dayPositions[i]
        })
      ) {
        position = i
        break
      }
    }

    if (position !== -1) {
      eventDays.forEach((day) => {
        const dayKey = startOfDay(day).toISOString()
        occupiedPositions[dayKey][position] = true
      })
      eventPositions[task.id] = position
    }
  })

  return eventPositions
}

export function getMonthCellEvents(
  date: Date,
  tasks: Task[],
  eventPositions: Record<string, number>
) {
  const eventsForDate = tasks.filter((task) => {
    const anchor = getTaskCalendarAnchor(task)
    if (!anchor) return false
    const eventStart = parseISO(anchor)
    const eventEnd = parseISO(anchor)
    return (
      (date >= eventStart && date <= eventEnd) ||
      isSameDay(date, eventStart) ||
      isSameDay(date, eventEnd)
    )
  })

  return eventsForDate
    .map((task) => ({
      ...task,
      position: eventPositions[task.id] ?? -1,
    }))
    .sort((a, b) => {
      return a.position - b.position
    })
}
