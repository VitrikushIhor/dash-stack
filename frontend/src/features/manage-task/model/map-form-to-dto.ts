import { type FileWithServerData } from '@/shared/api'
import { type LabelColor } from '@/entities/label'
import { type CreateTaskDto, type UpdateTaskDto } from '@/entities/task'
import { type TaskFormValues } from './create-task-schema'
import { ManageTaskMode } from './types'

function serializeDate(
  value: Date | null | undefined,
  mode: ManageTaskMode
): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return mode === ManageTaskMode.EDIT ? null : undefined
  return value.toISOString()
}

function collectAttachmentKeys(files: File[]): string[] {
  return files
    .map((file) => (file as FileWithServerData).s3Key)
    .filter((key): key is string => Boolean(key))
}

export function mapTaskFormToDto(
  values: TaskFormValues,
  mode: typeof ManageTaskMode.CREATE
): CreateTaskDto
export function mapTaskFormToDto(
  values: TaskFormValues,
  mode: typeof ManageTaskMode.EDIT
): UpdateTaskDto
export function mapTaskFormToDto(
  values: TaskFormValues,
  mode: ManageTaskMode = ManageTaskMode.CREATE
): CreateTaskDto | UpdateTaskDto {
  const attachmentKeys = collectAttachmentKeys(values.files ?? [])

  return {
    title: values.title,
    description: values.description,
    status: values.status,
    startDate: serializeDate(values.startDate, mode),
    dueDate: serializeDate(values.dueDate, mode),
    attachments: attachmentKeys,
    assigneeIds: values.assignees?.map((m: { id: string }) => m.id) || [],
    label: values.label
      ? {
          name: values.label.name,
          color: values.label.color as LabelColor,
        }
      : undefined,
    checklists:
      values.checklists?.map(
        (cl: {
          name: string
          items: { title: string; completed: boolean }[]
        }) => ({
          name: cl.name,
          items: cl.items.map(
            (item: { title: string; completed: boolean }) => ({
              title: item.title,
              completed: item.completed,
            })
          ),
        })
      ) || [],
  }
}
