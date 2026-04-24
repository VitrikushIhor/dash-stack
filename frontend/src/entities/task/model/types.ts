import { type Membership } from '@/shared/model/types/membership'
import { type Label } from '@/shared/ui/components/label/types.label'

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
  assignedMembers?: Membership[]
  deadline?: string
  assignedLabels?: Label[]
  checklists?: TodoChecklistType[]
  attachments?: string[]
}
