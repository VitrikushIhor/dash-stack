import { type Checklist } from '@/entities/task'

export interface CheckListTodoState {
  checklists: Checklist[]
}

export interface CheckListTodoActions {
  addChecklist: () => void
  updateChecklistName: (checklistId: string, newName: string) => void
  deleteChecklist: (checklistId: string) => void
  addTask: (checklistId: string, title: string) => void
  updateTask: (checklistId: string, taskId: string, newTitle: string) => void
  toggleTask: (checklistId: string, taskId: string) => void
  deleteTask: (checklistId: string, taskId: string) => void
  setChecklists: (checklists: Checklist[]) => void
}

export type ChecklistTodoStore = CheckListTodoState & CheckListTodoActions
