import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useState,
} from 'react'
import { type Task } from '@/entities/task'
import { type IUser, type TCalendarView, type TBadgeVariant } from './types'

interface ICalendarContext {
  selectedDate: Date
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: IUser['id'] | 'all'
  setSelectedUserId: (userId: IUser['id'] | 'all') => void
  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void
  users: IUser[]
  events: Task[]
  view: TCalendarView
  setView: Dispatch<SetStateAction<TCalendarView>>
  onEditTask?: (task: Task) => void
  onCreateTask?: () => void
}

const CalendarContext = createContext({} as ICalendarContext)

export function CalendarProvider({
  children,
  users,
  events,
  view: propsView,
  selectedDate: propsSelectedDate,
  onCreateTask,
  onEditTask,
}: {
  children: React.ReactNode
  users: IUser[]
  events: Task[]
  view?: TCalendarView
  selectedDate?: Date
  onCreateTask?: () => void
  onEditTask?: (task: Task) => void
}) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored')
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
        events,
        view,
        setView,
        onCreateTask,
        onEditTask,
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
