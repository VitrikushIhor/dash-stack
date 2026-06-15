import { type OrgRole } from '@/shared/model'
import { type LabelColor } from '@/shared/ui'

export enum TaskStatusEnum {
  PLANNED = 'PLANNED',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
}

export interface TaskAssignee {
  id: string // Membership ID
  userId: string
  orgId: string
  role: OrgRole
  joinedAt: string
  user: {
    id: string
    firstName: string
    email: string
    avatar?: string
  }
}

export interface TaskLabel {
  id: string
  name: string
  color: LabelColor
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
}

export interface Checklist {
  id: string
  name: string
  items: ChecklistItem[]
}

export interface Task {
  id: string
  title: string
  status: TaskStatusEnum
  description?: string
  startDate?: string | null // ISO string — optional start marker
  dueDate?: string | null // ISO string — primary deadline date
  completedAt?: string | null // ISO string — system-managed, set on COMPLETED
  attachments: string[]
  organizationId: string
  createdAt: string
  updatedAt: string
  assignees: TaskAssignee[]
  label: TaskLabel | null
  checklists?: Checklist[]
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatusEnum
  startDate?: string // ISO string
  dueDate?: string // ISO string
  attachments?: string[]
  assigneeIds?: string[] // Membership IDs
  label?: { name: string; color: LabelColor } | null
  checklists?: Array<{
    name: string
    items: Array<{ title: string; completed?: boolean }>
  }>
}

/**
 * On update, startDate and dueDate support explicit null to clear the field.
 * undefined = do not send (Prisma skips), null = clear (Prisma sets NULL).
 */
export interface UpdateTaskDto extends Partial<
  Omit<CreateTaskDto, 'startDate' | 'dueDate'>
> {
  startDate?: string | null
  dueDate?: string | null
}
