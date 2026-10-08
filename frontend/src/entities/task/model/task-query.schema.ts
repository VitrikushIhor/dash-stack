import { z } from 'zod'
import { OrganizationSlugSchema } from '@/shared/model'
import { TaskStatusEnum } from './types'

const TaskFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.enum(TaskStatusEnum)).optional(),
  assigneeIds: z.array(z.string()).optional(),
  labelNames: z.array(z.string()).optional(),
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().optional(),
})

export const TaskQueryInputSchema = z.object({
  slug: OrganizationSlugSchema,
  filters: TaskFiltersSchema.optional(),
})
