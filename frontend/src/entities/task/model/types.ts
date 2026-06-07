import { type OrgRole } from '@/shared/model/types/org-role'
import { type LabelColor } from '@/shared/ui/components/label/types.label'

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
  // deadline?: string // ISO string
  deadline: string // ISO string
  attachments: string[]
  organizationId: string
  createdAt: string
  updatedAt: string
  assignees: TaskAssignee[]
  label: TaskLabel
  checklists?: Checklist[]
}

export interface CreateTaskDto {
  title: string
  description?: string
  status?: TaskStatusEnum
  deadline?: string // ISO string
  attachments?: string[]
  assigneeIds?: string[] // Membership IDs
  label: { name: string; color: LabelColor }
  checklists?: Array<{
    name: string
    items: Array<{ title: string; completed?: boolean }>
  }>
}

export type UpdateTaskDto = Partial<CreateTaskDto>
