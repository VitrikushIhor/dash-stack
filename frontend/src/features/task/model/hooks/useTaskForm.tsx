import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fileToBase64 } from '@/shared/lib/utils'
import { type Membership } from '@/shared/model/types/membership'
import { type Label } from '@/shared/ui/components/label/types.label'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { useTaskStore } from '@/features/task'
import {
  taskFormSchema,
  type TaskFormValues,
} from '../schema/create-task-schema'
import {
  useChecklistTodoActions,
  useTodoChecklists,
} from '../store/checklist-todo-context'

export function useTaskForm(task?: Task, initialStatus?: TaskStatusEnum) {
  const [selectedMembers, setSelectedMembers] = useState<Membership[]>([])
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
      status: initialStatus ?? TaskStatusEnum.PLANNED,
      deadline: undefined,
    },
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || '',
        description: task.description || '',
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        status: task.status ?? TaskStatusEnum.PLANNED,
      })

      const fetchFiles = async () => {
        const loadedFiles = await loadFiles(task)
        setFiles(loadedFiles)
      }
      fetchFiles()

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMembers(task.assignedMembers || [])
      setSelectedLabels(task.assignedLabels || [])
      setChecklists(task.checklists || [])
    } else if (initialStatus !== undefined) {
      // Update form status when initialStatus changes (for new tasks)
      form.setValue('status', initialStatus)
      setFiles([])
      setSelectedMembers([])
      setSelectedLabels([])
      setChecklists([])
    }
  }, [task, initialStatus, form, setChecklists])

  const handleSubmit = async (values: TaskFormValues) => {
    const attachments = files.length
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
        attachments,
      })
    } else {
      addTask({
        ...values,
        id: crypto.randomUUID(),
        assignedMembers: selectedMembers,
        assignedLabels: selectedLabels,
        checklists,
        attachments,
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
    setFiles([])
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

async function loadFiles(task: Task) {
  if (task?.attachments && task?.attachments?.length > 0) {
    // example: task.attachments = ['https://.../file1.png', 'https://.../file2.pdf']
    const existingFiles = await Promise.all(
      task.attachments.map((url) => urlToFile(url, url.split('/').pop()!))
    )
    return existingFiles
  } else {
    return []
  }
}
async function urlToFile(url: string, filename: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const file = new File([blob], filename, { type: blob.type })
  return file
}
