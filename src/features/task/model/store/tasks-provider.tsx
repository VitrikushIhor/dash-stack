import React, { useState } from 'react'
import { TaskStatusEnum, type Task } from '@/entities/task'

type TasksDialogType = 'create' | 'update' | 'delete'

type TasksContextType = {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  status: TaskStatusEnum
  setStatus: React.Dispatch<React.SetStateAction<TaskStatusEnum>>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<TasksDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [status, setStatus] = useState<TaskStatusEnum>(TaskStatusEnum.PLANNED)

  return (
    <TasksContext
      value={{ open, setOpen, currentRow, setCurrentRow, status, setStatus }}
    >
      {children}
    </TasksContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}
