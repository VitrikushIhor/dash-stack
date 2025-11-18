import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fileToBase64 } from '@/shared/lib/utils'
import { type Label } from '@/shared/ui/components/label/types.label'
import { type Task } from '@/entities/task'
import { type TeamMember } from '@/entities/team'
import { useTaskStore } from '@/features/task'
import {
  useChecklistTodoActions,
  useTodoChecklists,
} from '../checklist-todo-context'
import { taskFormSchema, type TaskFormValues } from '../create-task-schema'

export function useTaskForm(task?: Task) {
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([])
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [files, setFiles] = useState<File[]>([])

  const checklists = useTodoChecklists()
  const { addChecklist, setChecklists } = useChecklistTodoActions()
  const { updateTask, addTask } = useTaskStore()

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: undefined,
      deadline: undefined,
    },
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || '',
        description: task.description || '',
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        status: task.status || undefined,
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMembers(task.assignedMembers || [])
      setSelectedLabels(task.assignedLabels || [])
      setChecklists(task.checklists || [])
      setFiles([])
    }
  }, [task, form, setChecklists])

  const handleSubmit = async (values: TaskFormValues) => {
    if (!task) return

    const attachment = files.length
      ? await Promise.all(files.map((file) => fileToBase64(file)))
      : []

    if (task) {
      updateTask(task.id, {
        ...values,
        id: task.id,
        deadline: values.deadline
          ? format(values.deadline, 'dd MMM yyyy')
          : undefined,
        status: task.status,
        assignedMembers: selectedMembers,
        assignedLabels: selectedLabels,
        checklists,
        attachment,
      })
    } else {
      addTask({
        ...values,
        id: crypto.randomUUID(),
        assignedMembers: selectedMembers,
        assignedLabels: selectedLabels,
        checklists,
        attachment,
        deadline: values.deadline
          ? format(values.deadline, 'dd MMM yyyy')
          : undefined,
      })
    }

    resetForm()
    return { success: true }
  }

  const resetForm = useCallback(() => {
    form.reset()
    setFiles([])
    setSelectedMembers([])
    setSelectedLabels([])
    setChecklists([])
  }, [form, setChecklists])

  return {
    // Form state
    form,
    selectedMembers,
    setSelectedMembers,
    selectedLabels,
    setSelectedLabels,
    files,
    setFiles,

    // Checklist state
    checklists,
    addChecklist,
    setChecklists,

    // Actions
    handleSubmit,
    resetForm,
  }
}
