import type { Task } from '@/entities/task'
import type { IUser, TEventColor } from '../model/types'

const LABEL_COLOR_MAP: Record<string, TEventColor> = {
  red: 'red',
  orange: 'orange',
  amber: 'yellow',
  yellow: 'yellow',
  lime: 'green',
  green: 'green',
  emerald: 'green',
  teal: 'blue',
  cyan: 'blue',
  sky: 'blue',
  blue: 'blue',
  indigo: 'purple',
  violet: 'purple',
  purple: 'purple',
  fuchsia: 'purple',
  pink: 'red',
  rose: 'red',
  gray: 'gray',
}

export const getTaskColor = (task: Task): TEventColor => {
  const label = task.label
  return (label ? LABEL_COLOR_MAP[label.color] : 'blue') ?? 'blue'
}

export const getTaskUser = (task: Task): IUser => {
  const assignee = task.assignees?.[0]
  return assignee
    ? {
        id: assignee.userId,
        name: assignee.user.firstName ?? assignee.user.email ?? 'Unknown',
        avatar: assignee.user.avatar ?? null,
      }
    : { id: 'unassigned', name: 'Unassigned', avatar: null }
}
