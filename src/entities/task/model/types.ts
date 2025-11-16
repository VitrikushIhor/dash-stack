import { type Label } from '@/shared/ui/components/label/types.label'
import { type TeamMember } from '@/entities/team'

export enum TaskStatusEnum {
  PLANNED = 'PLANNED',
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
}

export interface TodoTask {
  id: string
  title: string
  completed: boolean
}

export interface TodoChecklist {
  id: string
  name: string
  tasks: TodoTask[]
}

export interface Task {
  id: string
  title: string
  status: TaskStatusEnum
  description?: string
  assignedMembers?: TeamMember[]
  deadline?: Date
  assignedLabels?: Label[]
  checklists?: TodoChecklist[]
  attachment?: string[]
}
