import type { z } from 'zod'
import type { envSchema } from './env.schema'

export type FrontendEnv = z.infer<typeof envSchema>
