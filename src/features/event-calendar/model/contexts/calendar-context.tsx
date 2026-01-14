import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react'
import { parseISO, formatISO } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import { type Task, type TeamMember } from '../interfaces'
import { type TCalendarView, type TBadgeVariant } from '../types'

const route = getRouteApi('/_authenticated/calendar')

interface ICalendarContext {
  selectedDate: Date
  setSelectedDate: (date: Date | undefined) => void
  selectedUserId: TeamMember['id'] | 'all'
  setSelectedUserId: (userId: TeamMember['id'] | 'all') => void
  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void
  users: TeamMember[]
  events: Task[]
  setLocalEvents: Dispatch<SetStateAction<Task[]>>
  view: TCalendarView
  setView: Dispatch<SetStateAction<TCalendarView>>
}

const CalendarContext = createContext({} as ICalendarContext)

export function CalendarProvider({
  children,
  users,
  events,
}: {
  children: React.ReactNode
  users: TeamMember[]
  events: Task[]
}) {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored')

  // Derive view and date from URL params
  const view = useMemo<TCalendarView>(() => {
    if (
      search.view &&
      ['day', 'week', 'month', 'year', 'agenda'].includes(search.view)
    ) {
      return search.view as TCalendarView
    }
    return 'month'
  }, [search.view])

  const selectedDate = useMemo<Date>(() => {
    if (search.date) {
      try {
        const parsed = parseISO(search.date)
        if (!isNaN(parsed.getTime())) {
          return parsed
        }
      } catch {
        // Invalid date, fall back to today
      }
    }
    return new Date()
  }, [search.date])

  const [selectedUserId, setSelectedUserId] = useState<
    TeamMember['id'] | 'all'
  >('all')

  // This localEvents doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the events.
  // In a real scenario, the events would be updated in the backend
  // and the request that fetches the events should be refetched
  const [localEvents, setLocalEvents] = useState<Task[]>(events)

  // Update localEvents when events prop changes
  useEffect(() => {
    setLocalEvents(events)
  }, [events])

  const setView = (
    newView: TCalendarView | ((prev: TCalendarView) => TCalendarView)
  ) => {
    const currentView =
      search.view &&
      ['day', 'week', 'month', 'year', 'agenda'].includes(search.view)
        ? (search.view as TCalendarView)
        : 'month'
    const nextView =
      typeof newView === 'function' ? newView(currentView) : newView
    navigate({
      search: (prev) => ({
        ...prev,
        view: nextView === 'month' ? undefined : nextView,
      }),
    })
  }

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    navigate({
      search: (prev) => ({
        ...prev,
        date: formatISO(date, { representation: 'date' }),
      }),
    })
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
        // If you go to the refetch approach, you can remove the localEvents and pass the events directly
        events: localEvents,
        setLocalEvents,
        view,
        setView: setView as Dispatch<SetStateAction<TCalendarView>>,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext)
  if (!context)
    throw new Error('useCalendar must be used within a CalendarProvider.')
  return context
}
