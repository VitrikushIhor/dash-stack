import { z } from 'zod'

export const sessionIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/)
export const activeSessionSchema = z.object({
  id: sessionIdSchema,
  createdAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
  userAgent: z.string().nullable(),
  isCurrent: z.boolean(),
})
export const activeSessionsSchema = z.object({
  data: z.array(activeSessionSchema).max(20),
  meta: z.object({
    total: z.number().int().nonnegative(),
    lastPage: z.number().int().positive(),
    currentPage: z.number().int().positive(),
    perPage: z.number().int().positive(),
    prev: z.number().int().positive().nullable(),
    next: z.number().int().positive().nullable(),
  }),
})
export const revokeSessionSchema = z.object({
  revokedCurrentSession: z.boolean(),
})
