import { z } from 'zod'
import { labelColorNames } from './types'

export const LabelIdSchema = z.string().min(1, 'Label ID is required')

export const labelSchema = z.object({
  id: LabelIdSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
  color: z.enum(labelColorNames),
  organizationId: z.string().min(1, 'Organization ID is required'),
})

export const CreateLabelDtoSchema = labelSchema.pick({
  name: true,
  color: true,
})

export const UpdateLabelDtoSchema = labelSchema
  .pick({
    name: true,
    color: true,
  })
  .partial()

export type LabelDto = z.infer<typeof labelSchema>
export type CreateLabelDto = z.infer<typeof CreateLabelDtoSchema>
export type UpdateLabelDto = z.infer<typeof UpdateLabelDtoSchema>
