import { type Label } from '@/shared/ui/components/label/types.label'
import { type TeamMember } from '@/entities/team'

export enum TaskStatusEnum {
  PLANNED = 'PLANNED',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
}

export interface CheckListTodoTask {
  id: string
  title: string
  completed: boolean
}

export interface TodoChecklistType {
  id: string
  name: string
  tasks: CheckListTodoTask[]
}

export interface Task {
  id: string
  title: string
  status: TaskStatusEnum
  description?: string
  assignedMembers?: TeamMember[]
  deadline?: string
  assignedLabels?: Label[]
  checklists?: TodoChecklistType[]
  attachments?: string[]
}
