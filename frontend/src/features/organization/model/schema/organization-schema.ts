import { z } from 'zod'

export const CreateOrgSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
})

export type CreateOrgFormValues = z.infer<typeof CreateOrgSchema>

export const UpdateOrgSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  files: z.array(z.custom<File>((v) => v instanceof File)).optional(),
})

export type UpdateOrgFormValues = z.infer<typeof UpdateOrgSchema>
