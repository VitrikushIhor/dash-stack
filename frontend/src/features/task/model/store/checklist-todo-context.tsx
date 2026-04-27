import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { type Checklist } from '@/entities/task'
import { type ChecklistTodoStore } from '../types/checklist-types'

const ChecklistTodoContext = createContext<ChecklistTodoStore | null>(null)

interface TodoProviderProps {
  children: ReactNode
  initialChecklists?: Checklist[]
}

export function ChecklistTodoProvider({
  children,
  initialChecklists = [],
}: TodoProviderProps) {
  const [checklists, setChecklists] = useState<Checklist[]>(initialChecklists)

  const addChecklist = useCallback(() => {
    setChecklists((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Checklist ${prev.length + 1}`,
        items: [],
      },
    ])
  }, [])

  const updateChecklistName = useCallback(
    (checklistId: string, newName: string) => {
      setChecklists((prev) =>
        prev.map((checklist) =>
          checklist.id === checklistId
            ? { ...checklist, name: newName }
            : checklist
        )
      )
    },
    []
  )

  const deleteChecklist = useCallback((checklistId: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== checklistId))
  }, [])

  const addTask = useCallback((checklistId: string, title: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: [
                ...checklist.items,
                {
                  id: crypto.randomUUID(),
                  title,
                  completed: false,
                },
              ],
            }
          : checklist
      )
    )
  }, [])

  const updateTask = useCallback(
    (checklistId: string, taskId: string, newTitle: string) => {
      setChecklists((prev) =>
        prev.map((checklist) =>
          checklist.id === checklistId
            ? {
                ...checklist,
                items: checklist.items.map((task) =>
                  task.id === taskId ? { ...task, title: newTitle } : task
                ),
              }
            : checklist
        )
      )
    },
    []
  )

  const toggleTask = useCallback((checklistId: string, taskId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : checklist
      )
    )
  }, [])

  const deleteTask = useCallback((checklistId: string, taskId: string) => {
    setChecklists((prev) =>
      prev.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.filter((task) => task.id !== taskId),
            }
          : checklist
      )
    )
  }, [])

  const value = useMemo<ChecklistTodoStore>(
    () => ({
      checklists,
      addChecklist,
      updateChecklistName,
      deleteChecklist,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      setChecklists,
    }),
    [
      checklists,
      addChecklist,
      updateChecklistName,
      deleteChecklist,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      setChecklists,
    ]
  )

  return (
    <ChecklistTodoContext.Provider value={value}>
      {children}
    </ChecklistTodoContext.Provider>
  )
}

export function useCheckListTodoContext() {
  const context = useContext(ChecklistTodoContext)

  if (!context) {
    throw new Error(
      'useCheckListTodoContext must be used within ChecklistTodoProvider'
    )
  }

  return context
}

export function useTodoChecklists() {
  const { checklists } = useCheckListTodoContext()
  return checklists
}

export function useChecklistTodoActions() {
  const {
    addChecklist,
    updateChecklistName,
    deleteChecklist,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    setChecklists,
  } = useCheckListTodoContext()

  return useMemo(
    () => ({
      addChecklist,
      updateChecklistName,
      deleteChecklist,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      setChecklists,
    }),
    [
      addChecklist,
      updateChecklistName,
      deleteChecklist,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      setChecklists,
    ]
  )
}

export function useChecklist(checklistId: string) {
  const { checklists } = useCheckListTodoContext()
  return useMemo(
    () => checklists.find((c) => c.id === checklistId),
    [checklists, checklistId]
  )
}
