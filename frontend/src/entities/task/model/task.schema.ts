import { z } from 'zod'
import { labelColorNames } from '@/entities/label'
import { TaskStatusEnum } from './types'

export const CreateTaskDtoSchema = z.object({
  title: z.string().min(1),
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
  ids: z.array(z.string().min(1)),
  data: z.object({
    status: z.nativeEnum(TaskStatusEnum).optional(),
  }),
})

export const BulkDeleteTasksDtoSchema = z.array(z.string().min(1))
