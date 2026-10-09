import { z } from 'zod'
import {
  CreateLabelDtoSchema,
  LabelIdSchema,
  UpdateLabelDtoSchema,
} from '@/entities/label'
import { OrganizationSlugSchema } from '@/entities/organization'

export const CreateLabelActionSchema = z.object({
  slug: OrganizationSlugSchema,
  data: CreateLabelDtoSchema,
})

export const UpdateLabelActionSchema = z.object({
  slug: OrganizationSlugSchema,
  id: LabelIdSchema,
  data: UpdateLabelDtoSchema,
})

export const DeleteLabelActionSchema = z.object({
  slug: OrganizationSlugSchema,
  id: LabelIdSchema,
})
