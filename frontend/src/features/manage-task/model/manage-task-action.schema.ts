import { z } from 'zod'
import { OrganizationSlugSchema } from '@/entities/organization'
import {
  BulkDeleteTasksDtoSchema,
  BulkUpdateTasksDtoSchema,
  CreateTaskDtoSchema,
  TaskIdSchema,
  UpdateTaskDtoSchema,
} from '@/entities/task'

export const CreateTaskActionSchema = z.object({
  slug: OrganizationSlugSchema,
  data: CreateTaskDtoSchema,
})

export const TaskByIdActionSchema = z.object({
  slug: OrganizationSlugSchema,
  id: TaskIdSchema,
})

export const UpdateTaskActionSchema = TaskByIdActionSchema.extend({
  data: UpdateTaskDtoSchema,
})

export const BulkDeleteTasksActionSchema = z.object({
  slug: OrganizationSlugSchema,
  ids: BulkDeleteTasksDtoSchema,
})

export const BulkUpdateTasksActionSchema = z.object({
  slug: OrganizationSlugSchema,
  ids: BulkUpdateTasksDtoSchema.shape.ids,
  data: BulkUpdateTasksDtoSchema.shape.data,
})
