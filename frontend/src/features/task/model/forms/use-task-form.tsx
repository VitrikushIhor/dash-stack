import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fileToBase64 } from '@/shared/lib/utils'
import { type Membership } from '@/shared/model/types/membership'
import {
  type Label,
  type LabelColor,
} from '@/shared/ui/components/label/types.label'
import {
  TaskStatusEnum,
  type Task,
  type CreateTaskDto,
  type UpdateTaskDto,
  loadFilesFromUrls,
} from '@/entities/task'
import { useCreateTask, useUpdateTask } from '../mutations'
import {
  taskFormSchema,
  type TaskFormValues,
} from '../schema/create-task-schema'
import {
  useChecklistTodoActions,
  useTodoChecklists,
} from '../store/checklist-todo-context'

export function useTaskForm(
  orgId: string,
  task?: Task,
  initialStatus?: TaskStatusEnum
) {
  const [selectedMembers, setSelectedMembers] = useState<Membership[]>([])
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([])
  const [files, setFiles] = useState<File[]>([])

  const checklists = useTodoChecklists()
  const { addChecklist, setChecklists } = useChecklistTodoActions()

  const createTaskMutation = useCreateTask(orgId)
  const updateTaskMutation = useUpdateTask(orgId)

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
        const loadedFiles = await loadFilesFromUrls(task.attachments || [])
        setFiles(loadedFiles)
      }
      fetchFiles()

      const mappedMembers: Membership[] = (task.assignees || []).map((a) => ({
        id: a.id,
        user: {
          ...a.user,
          email: a.user.email,
          firstName: a.user.firstName,
          avatar: a.user.avatar || undefined,
        },
        userId: a.userId,
        orgId: a.orgId,
        role: a.role,
        joinedAt: a.joinedAt,
      }))

      setSelectedMembers(mappedMembers)

      const mappedLabels: Label[] = (task.labels || []).map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color as LabelColor,
      }))

      setSelectedLabels(mappedLabels)

      setChecklists(task.checklists || [])
    } else if (initialStatus !== undefined) {
      form.setValue('status', initialStatus)
      setFiles([])
      setSelectedMembers([])
      setSelectedLabels([])
      setChecklists([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, initialStatus, form])

  const handleSubmit = async (values: TaskFormValues) => {
    if (!orgId) {
      toast.error('No organization selected')
      return
    }

    try {
      const attachments = files.length
        ? await Promise.all(files.map((file) => fileToBase64(file)))
        : []

      const baseData = {
        title: values.title,
        description: values.description,
        status: values.status,
        deadline: values.deadline?.toISOString(),
        attachments: attachments.length ? attachments : undefined,
        assigneeIds: selectedMembers.map((m) => m.id),
        labels: selectedLabels.map((l) => ({ name: l.name, color: l.color })),
        checklists: checklists.map((cl) => ({
          name: cl.name,
          items: cl.items.map((item) => ({
            title: item.title,
            completed: item.completed,
          })),
        })),
      }

      if (task) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          data: baseData as UpdateTaskDto,
        })
      } else {
        await createTaskMutation.mutateAsync(baseData as CreateTaskDto)
      }

      resetForm()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const resetForm = useCallback(() => {
    form.reset()
    setFiles([])
    setSelectedMembers([])
    setSelectedLabels([])
    setChecklists([])
  }, [form, setChecklists])

  return {
    form,
    selectedMembers,
    setSelectedMembers,
    selectedLabels,
    setSelectedLabels,
    files,
    setFiles,
    checklists,
    addChecklist,
    setChecklists,
    handleSubmit,
    resetForm,
    isSubmitting: createTaskMutation.isPending || updateTaskMutation.isPending,
  }
}
