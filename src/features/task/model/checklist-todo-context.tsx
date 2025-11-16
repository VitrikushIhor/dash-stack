import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { type ChecklistTodoStore, type TodoChecklistType } from './types'

const ChecklistTodoContext = createContext<ChecklistTodoStore | null>(null)

interface TodoProviderProps {
  children: ReactNode
  initialChecklists?: TodoChecklistType[]
}

export function ChecklistTodoProvider({
  children,
  initialChecklists = [],
}: TodoProviderProps) {
  const [checklists, setChecklists] =
    useState<TodoChecklistType[]>(initialChecklists)

  const addChecklist = useCallback(() => {
    setChecklists((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `Checklist ${prev.length + 1}`,
        tasks: [],
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
              tasks: [
                ...checklist.tasks,
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
                tasks: checklist.tasks.map((task) =>
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
              tasks: checklist.tasks.map((task) =>
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
              tasks: checklist.tasks.filter((task) => task.id !== taskId),
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
    ]
  )

  return (
    <ChecklistTodoContext.Provider value={value}>
      {children}
    </ChecklistTodoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCheckListTodoContext() {
  const context = useContext(ChecklistTodoContext)

  if (!context) {
    throw new Error('useTodoContext must be used within TodoProvider')
  }

  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTodoChecklists() {
  const { checklists } = useCheckListTodoContext()
  return checklists
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChecklistTodoActions() {
  const {
    addChecklist,
    updateChecklistName,
    deleteChecklist,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
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
    }),
    [
      addChecklist,
      updateChecklistName,
      deleteChecklist,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
    ]
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChecklist(checklistId: string) {
  const { checklists } = useCheckListTodoContext()
  return useMemo(
    () => checklists.find((c) => c.id === checklistId),
    [checklists, checklistId]
  )
}
