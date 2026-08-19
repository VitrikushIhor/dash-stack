import { z } from 'zod'
import { labelColorNames } from '@/shared/model'
import { TaskStatusEnum } from './types'

export const TaskIdSchema = z.string().min(1, 'Task ID is required')

export const CreateTaskDtoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatusEnum).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  assigneeIds: z.array(z.string()).optional(),
  label: z
    .object({
      name: z.string(),
      color: z.enum(labelColorNames),
    })
    .nullable()
    .optional(),
  checklists: z
    .array(
      z.object({
        name: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            completed: z.boolean().optional(),
          })
        ),
      })
    )
    .optional(),
})

export const UpdateTaskDtoSchema = CreateTaskDtoSchema.partial().extend({
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export const BulkUpdateTasksDtoSchema = z.object({
  ids: z.array(TaskIdSchema).min(1, 'At least one task ID is required'),
  data: z.object({
    status: z.nativeEnum(TaskStatusEnum).optional(),
  }),
})

export const BulkDeleteTasksDtoSchema = z
  .array(TaskIdSchema)
  .min(1, 'At least one task ID is required')
