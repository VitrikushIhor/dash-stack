export type TCalendarView = 'day' | 'week' | 'month' | 'year' | 'agenda'
export type TEventColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'gray'
  | 'orange'
export type TBadgeVariant = 'dot' | 'colored' | 'mixed'
export type TVisibleHours = { from: number; to: number }

export interface IUser {
  id: string
  name: string
  avatar: string | null
}

export interface IEvent {
  id: string
  startDate: string
  endDate: string
  title: string
  color: TEventColor
  description: string
  user: IUser
}

export interface ICalendarCell {
  day: number
  currentMonth: boolean
  date: Date
}
