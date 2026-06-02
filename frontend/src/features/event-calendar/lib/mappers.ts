import type { Task } from '@/entities/task'
import type { IEvent, IUser, TEventColor } from '../model/types'

interface UserLike {
  user: {
    id: string
    firstName?: string | null
    email?: string | null
    avatar?: string | null
  }
}

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

export const memberToUser = (data: UserLike): IUser => ({
  id: data.user.id,
  name: data.user.firstName ?? data.user.email ?? 'Unknown',
  avatar: data.user.avatar ?? null,
})

export const taskToEvent = (task: Task): IEvent => {
  const assignee = task.assignees?.[0]
  const user: IUser = assignee
    ? memberToUser(assignee)
    : { id: 'unassigned', name: 'Unassigned', avatar: null }

  const label = task.labels?.[0]
  const color = (label ? LABEL_COLOR_MAP[label.color] : 'blue') ?? 'blue'

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    startDate: task.deadline ?? new Date().toISOString(),
    endDate: task.deadline ?? new Date().toISOString(),
    color,
    user,
  }
}
