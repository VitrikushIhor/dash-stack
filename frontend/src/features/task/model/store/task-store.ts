import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type TaskStatusEnum } from '@/entities/task'

interface TaskFilters {
  status?: TaskStatusEnum
  assigneeId?: string
}

interface TaskUiState {
  selectedTaskId: string | null
  isDrawerOpen: boolean
  activeFilters: TaskFilters
  setSelectedTaskId: (id: string | null) => void
  setIsDrawerOpen: (isOpen: boolean) => void
  setActiveFilters: (filters: TaskFilters) => void
  resetFilters: () => void
}

export const useTaskStore = create<TaskUiState>()(
  devtools(
    (set) => ({
      selectedTaskId: null,
      isDrawerOpen: false,
      activeFilters: {},

      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      setActiveFilters: (filters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        })),
      resetFilters: () => set({ activeFilters: {} }),
    }),
    { name: 'TaskStore' }
  )
)
