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

export interface IUser {
  id: string
  name: string
  avatar: string | null
}

export interface ICalendarCell {
  day: number
  currentMonth: boolean
  date: Date
}
