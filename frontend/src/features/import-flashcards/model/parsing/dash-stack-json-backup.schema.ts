import { z } from 'zod'

export const DashStackJsonBackupSchema = z
  .object({
    schemaVersion: z.literal(1),
    cards: z.array(
      z
        .object({
          term: z.string(),
          definition: z.string(),
          example: z.string().nullable(),
          imageUrl: z.string().nullable(),
        })
        .strict()
    ),
  })
  .strict()
