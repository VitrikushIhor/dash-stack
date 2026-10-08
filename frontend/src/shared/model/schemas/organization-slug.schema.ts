import { z } from 'zod'

export const OrganizationSlugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  )
