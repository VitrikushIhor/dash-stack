import { create } from 'zustand'
import { type Task } from '@/entities/task'

export enum TaskModalMode {
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
}

type TaskModalState = {
  isOpen: boolean
  mode: TaskModalMode
  selectedTask: Task | null
  openCreate: (initialData?: Partial<Task>) => void
  openEdit: (task: Task) => void
  openDelete: (task: Task) => void
  close: () => void
}

export const useTaskModalStore = create<TaskModalState>((set) => ({
  isOpen: false,
  mode: TaskModalMode.CREATE,
  selectedTask: null,
  openCreate: (initialData) =>
    set({
      isOpen: true,
      mode: TaskModalMode.CREATE,
      selectedTask: (initialData as Task) ?? null,
    }),
  openEdit: (task) =>
    set({ isOpen: true, mode: TaskModalMode.EDIT, selectedTask: task }),
  openDelete: (task) =>
    set({ isOpen: true, mode: TaskModalMode.DELETE, selectedTask: task }),
  close: () => set({ isOpen: false, selectedTask: null }),
}))
