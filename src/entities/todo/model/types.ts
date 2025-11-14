import { type Label } from '@/shared/ui/components/label/types.label'
import { type TeamMember } from '@/entities/team'

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

export interface TodoActivity {
  id: string
  user: string
  action: string
  timestamp: string
  details?: string
}

export interface Todo {
  id: string
  title: string
  description: string
  members: TeamMember[]
  dueDate: Date
  labels: Label[]
  checklists: TodoChecklist[]
  activities: TodoActivity[]
}
