import z from 'zod'
import { OrgRole } from '@/shared/model/types/org-role'
import { labelColorNames } from '@/shared/ui/components/label/types.label'
import { TaskStatusEnum } from './types'

export const labelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.enum(labelColorNames),
})

export const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean(),
})

export const checklistSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  items: z.array(checklistItemSchema),
})

export const membershipSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orgId: z.string(),
  role: z.nativeEnum(OrgRole),
  position: z.string().optional(),
  joinedAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
})

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(TaskStatusEnum, { message: 'Status is required' }),
  deadline: z.date().optional(),
  assignees: z.array(membershipSchema),
  label: labelSchema.nullable(),
  files: z.array(z.custom<File>((v) => v instanceof File)),
  checklists: z.array(checklistSchema),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
