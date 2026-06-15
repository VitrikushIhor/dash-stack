import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type Task,
  TaskStatusEnum,
  taskFormSchema,
  type TaskFormValues,
} from '@/entities/task'

export function useTaskForm({
  initialTask,
}: { initialTask?: Task | null } = {}) {
  const defaultFormData: TaskFormValues = {
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status ?? TaskStatusEnum.PLANNED,
    startDate: initialTask?.startDate
      ? new Date(initialTask.startDate)
      : undefined,
    dueDate: initialTask?.dueDate ? new Date(initialTask.dueDate) : undefined,
    assignees: initialTask?.assignees || [],
    label: initialTask?.label || null,
    files: [],
    checklists: initialTask?.checklists || [],
  }

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultFormData,
  })

  return {
    form,
    handleSubmit: form.handleSubmit,
    reset: form.reset,
    defaultFormData,
  }
}
