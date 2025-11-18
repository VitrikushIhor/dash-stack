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

export interface CheckListTodoState {
  checklists: TodoChecklistType[]
}

export interface CheckListTodoActions {
  addChecklist: () => void
  updateChecklistName: (checklistId: string, newName: string) => void
  deleteChecklist: (checklistId: string) => void
  addTask: (checklistId: string, title: string) => void
  updateTask: (checklistId: string, taskId: string, newTitle: string) => void
  toggleTask: (checklistId: string, taskId: string) => void
  deleteTask: (checklistId: string, taskId: string) => void
  setChecklists: (checklists: TodoChecklistType[]) => void
}

export type ChecklistTodoStore = CheckListTodoState & CheckListTodoActions
