import z from 'zod'

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
