import z from 'zod'
import { labelColorNames } from '@/shared/ui'
import { checklistSchema } from '@/features/checklist'
import { membershipSchema } from '@/features/team'
import { TaskStatusEnum } from './types'

export { checklistSchema, membershipSchema }
export { checklistItemSchema } from '@/features/checklist'

export const labelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.enum(labelColorNames),
})

export const taskFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(5000).optional(),
    status: z.enum(TaskStatusEnum, { message: 'Status is required' }),
    startDate: z.date().nullable().optional(),
    dueDate: z.date().nullable().optional(),
    assignees: z.array(membershipSchema),
    label: labelSchema.nullable(),
    files: z.array(z.custom<File>((v) => v instanceof File)),
    checklists: z.array(checklistSchema),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date must be on or after start date',
        path: ['dueDate'],
      })
    }
    if (!data.label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Label is required',
        path: ['label'],
      })
    }
  })

export type TaskFormValues = z.infer<typeof taskFormSchema>
