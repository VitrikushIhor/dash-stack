import { useState, useCallback, useMemo } from 'react'
import { type Checklist } from '@/entities/task'

export function useChecklistWidget(
  checklist: Checklist,
  onChange: (checklist: Checklist) => void,
  onDelete: (checklistId: string) => void
) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(checklist.name || '')
  const [editedTaskId, setEditedTaskId] = useState<string | null>(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState('')

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleNameSave = useCallback(() => {
    const trimmedName = editedName.trim()
    if (trimmedName && trimmedName !== checklist.name) {
      onChange({ ...checklist, name: trimmedName })
    }
    setIsEditingName(false)
  }, [editedName, checklist, onChange])

  const handleNameCancel = useCallback(() => {
    setEditedName(checklist.name || '')
    setIsEditingName(false)
  }, [checklist.name])

  const handleAddTask = useCallback(() => {
    const trimmedTitle = newTaskTitle.trim()
    if (trimmedTitle) {
      onChange({
        ...checklist,
        items: [
          ...(checklist.items || []),
          { id: crypto.randomUUID(), title: trimmedTitle, completed: false },
        ],
      })
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }, [newTaskTitle, checklist, onChange])

  const handleDelete = useCallback(() => {
    onDelete(checklist.id)
  }, [checklist.id, onDelete])

  const startEditingName = useCallback(() => {
    setIsEditingName(true)
  }, [])

  const startAddingTask = useCallback(() => {
    setIsAdding(true)
  }, [])

  const cancelAddingTask = useCallback(() => {
    setIsAdding(false)
    setNewTaskTitle('')
  }, [])

  const startEditingTask = useCallback(
    (taskId: string, currentTitle: string) => {
      setEditedTaskId(taskId)
      setEditedTaskTitle(currentTitle)
    },
    []
  )

  const handleTaskToggle = useCallback(
    (taskId: string) => {
      onChange({
        ...checklist,
        items: checklist.items.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      })
    },
    [checklist, onChange]
  )

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      onChange({
        ...checklist,
        items: checklist.items.filter((task) => task.id !== taskId),
      })
    },
    [checklist, onChange]
  )

  const handleTaskUpdate = useCallback(
    (taskId: string, newTitle: string) => {
      onChange({
        ...checklist,
        items: checklist.items.map((task) =>
          task.id === taskId ? { ...task, title: newTitle } : task
        ),
      })
    },
    [checklist, onChange]
  )

  const completedCount = useMemo(
    () => checklist.items?.filter((task) => task.completed).length || 0,
    [checklist.items]
  )

  const progressText = useMemo(
    () => `${completedCount}/${checklist.items?.length || 0}`,
    [completedCount, checklist.items?.length]
  )

  return {
    isExpanded,
    toggleExpanded,
    newTaskTitle,
    setNewTaskTitle,
    isAdding,
    isEditingName,
    editedName,
    setEditedName,
    editedTaskId,
    setEditedTaskId,
    editedTaskTitle,
    setEditedTaskTitle,
    handleNameSave,
    handleNameCancel,
    handleAddTask,
    handleDelete,
    startEditingName,
    startAddingTask,
    cancelAddingTask,
    startEditingTask,
    handleTaskToggle,
    handleTaskDelete,
    handleTaskUpdate,
    progressText,
  }
}
