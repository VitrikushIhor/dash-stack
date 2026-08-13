import { type TCalendarView } from '../../model/calendar-types'
import { useCalendarSearchParams } from '../../model/calendar-search-params'
import { useMemo } from 'react'
import {
  format,
  isSameDay,
  parseISO,
  getDaysInMonth,
  startOfMonth,
} from 'date-fns'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { SHORT_WEEK_DAYS } from '../../lib/constants'

import { YearViewDayCell } from './year-view-day-cell'

interface IProps {
  month: Date
  tasks: Task[]
}

export function YearViewMonth({ month, tasks }: IProps) {
  const [, setParams] = useCalendarSearchParams()
  const setView = (v: TCalendarView) => setParams({ view: v })
  const setSelectedDate = (d: Date) => setParams({ date: d })

  const monthName = format(month, 'MMMM')

  const daysInMonth = useMemo(() => {
    const totalDays = getDaysInMonth(month)
    const firstDay = startOfMonth(month).getDay()

    const days = Array.from({ length: totalDays }, (_, i) => i + 1)
    const blanks = Array(firstDay).fill(null)

    return [...blanks, ...days]
  }, [month])

  const weekDays = SHORT_WEEK_DAYS

  const handleClick = () => {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1))
    setView('month')
  }

  return (
    <div className='flex flex-col'>
      <button
        type='button'
        onClick={handleClick}
        className='hover:bg-accent focus-visible:ring-ring w-full rounded-t-lg border px-3 py-2 text-sm font-semibold focus-visible:ring-1 focus-visible:outline-none'
      >
        {monthName}
      </button>

      <div className='flex-1 space-y-2 rounded-b-lg border border-t-0 p-3'>
        <div className='grid grid-cols-7 gap-x-0.5 text-center'>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className='text-muted-foreground text-xs font-medium'
            >
              {day}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-x-0.5 gap-y-2'>
          {daysInMonth.map((day, index) => {
            if (day === null)
              return <div key={`blank-${index}`} className='h-10' />

            const date = new Date(month.getFullYear(), month.getMonth(), day)
            const dayEvents = tasks.filter((task) => {
              const anchor = getTaskCalendarAnchor(task)
              return anchor && isSameDay(parseISO(anchor), date)
            })

            return (
              <YearViewDayCell
                key={`day-${day}`}
                day={day}
                date={date}
                tasks={dayEvents}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
