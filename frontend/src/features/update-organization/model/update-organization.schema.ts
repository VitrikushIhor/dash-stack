import type { z } from 'zod'
import { BaseOrgSchema } from '@/entities/organization'

export const UpdateOrgSchema = BaseOrgSchema

export type UpdateOrgFormValues = z.infer<typeof UpdateOrgSchema>
