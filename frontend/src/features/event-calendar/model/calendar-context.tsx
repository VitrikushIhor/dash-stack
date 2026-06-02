'use client'

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useState,
} from 'react'
import {
  type IUser,
  type IEvent,
  type TCalendarView,
  type TBadgeVariant,
  type TVisibleHours,
} from './types'

interface ICalendarContext {
  selectedDate: Date
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: IUser['id'] | 'all'
  setSelectedUserId: (userId: IUser['id'] | 'all') => void
  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void
  users: IUser[]
  visibleHours: TVisibleHours
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>
  events: IEvent[]
  view: TCalendarView
  setView: Dispatch<SetStateAction<TCalendarView>>
}

const CalendarContext = createContext({} as ICalendarContext)

const VISIBLE_HOURS = { from: 7, to: 18 }
export function CalendarProvider({
  children,
  users,
  events,
  view: propsView,
  selectedDate: propsSelectedDate,
}: {
  children: React.ReactNode
  users: IUser[]
  events: IEvent[]
  view?: TCalendarView
  selectedDate?: Date
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored')
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS)
  const [view, setView] = useState<TCalendarView>(propsView || 'month')
  const [selectedDate, setSelectedDate] = useState(
    propsSelectedDate || new Date()
  )
  const [selectedUserId, setSelectedUserId] = useState<IUser['id'] | 'all'>(
    'all'
  )

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
  }

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedUserId,
        setSelectedUserId,
        badgeVariant,
        setBadgeVariant,
        users,
        visibleHours,
        setVisibleHours,
        events,
        view,
        setView,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext)
  if (!context)
    throw new Error('useCalendar must be used within a CalendarProvider.')
  return context
}
