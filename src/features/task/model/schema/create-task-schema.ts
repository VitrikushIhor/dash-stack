import z from 'zod'
import { TaskStatusEnum } from '@/entities/task'

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(TaskStatusEnum, { error: 'Status is required' }),
  deadline: z.date().optional(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
