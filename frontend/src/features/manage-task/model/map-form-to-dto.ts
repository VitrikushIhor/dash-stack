import { fileToBase64 } from '@/shared/lib/utils'
import { type CreateTaskDto, type TaskFormValues } from '@/entities/task'

export const mapTaskFormToDto = async (
  values: TaskFormValues
): Promise<CreateTaskDto> => {
  const attachments = values.files?.length
    ? await Promise.all(values.files.map((file: File) => fileToBase64(file)))
    : []

  return {
    title: values.title,
    description: values.description,
    status: values.status,
    deadline: values.deadline?.toISOString(),
    attachments: attachments.length ? attachments : undefined,
    assigneeIds: values.assignees?.map((m) => m.id) || [],
    label: values.label
      ? { name: values.label.name, color: values.label.color }
      : undefined,
    checklists:
      values.checklists?.map((cl) => ({
        name: cl.name,
        items: cl.items.map((item) => ({
          title: item.title,
          completed: item.completed,
        })),
      })) || [],
  } as CreateTaskDto
}
