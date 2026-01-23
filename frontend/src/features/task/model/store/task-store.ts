import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'
import { type Task } from '@/entities/task'

interface TaskState {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  clearTasks: () => void
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set) => ({
        tasks: [],

        addTask: (task) =>
          set((state) => ({
            tasks: [...state.tasks, task],
          })),

        updateTask: (id, updatedTask) =>
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, ...updatedTask } : t
            ),
          })),

        deleteTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          })),

        clearTasks: () => set({ tasks: [] }),
      }),
      {
        name: 'task-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ tasks: state.tasks }),
      }
    ),
    { name: 'TaskStore' }
  )
)
