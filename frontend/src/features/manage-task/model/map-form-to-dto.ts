import { fileToBase64 } from '@/shared/lib/utils'
import { type LabelColor } from '@/shared/ui'
import {
  type CreateTaskDto,
  type UpdateTaskDto,
  type TaskFormValues,
} from '@/entities/task'
import { TaskModalMode } from './use-task-modal-store'

/**
 * Serialises a form date field for the API payload.
 *
 * - `undefined` → `undefined`  (Prisma/backend skips the field — no change on update)
 * - `null`      → depends on mode:
 *     - 'create' → `undefined`  (backend create DTO does not accept null)
 *     - 'edit'   → `null`       (backend update DTO accepts null to clear the column)
 * - `Date`      → ISO string
 */
function serializeDate(
  value: Date | null | undefined,
  mode: TaskModalMode
): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return mode === TaskModalMode.EDIT ? null : undefined
  return value.toISOString()
}

export async function mapTaskFormToDto(
  values: TaskFormValues,
  mode: TaskModalMode.CREATE
): Promise<CreateTaskDto>
export async function mapTaskFormToDto(
  values: TaskFormValues,
  mode: TaskModalMode.EDIT
): Promise<UpdateTaskDto>
export async function mapTaskFormToDto(
  values: TaskFormValues,
  mode: TaskModalMode = TaskModalMode.CREATE
): Promise<CreateTaskDto | UpdateTaskDto> {
  const attachments = values.files?.length
    ? await Promise.all(values.files.map((file: File) => fileToBase64(file)))
    : []

  return {
    title: values.title,
    description: values.description,
    status: values.status,
    startDate: serializeDate(values.startDate, mode),
    dueDate: serializeDate(values.dueDate, mode),
    attachments: attachments.length ? attachments : undefined,
    assigneeIds: values.assignees?.map((m) => m.id) || [],
    label: values.label
      ? {
          name: values.label.name,
          color: values.label.color as LabelColor,
        }
      : undefined,
    checklists:
      values.checklists?.map((cl) => ({
        name: cl.name,
        items: cl.items.map((item) => ({
          title: item.title,
          completed: item.completed,
        })),
      })) || [],
  }
}
