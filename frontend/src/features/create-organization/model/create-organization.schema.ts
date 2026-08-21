import type { z } from 'zod'
import { BaseOrgSchema } from '@/entities/organization'

export const CreateOrgSchema = BaseOrgSchema

export type CreateOrgFormValues = z.infer<typeof CreateOrgSchema>
