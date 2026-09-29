import { envSchema } from './env.schema'
import type { FrontendEnv } from './env.types'

export function parseFrontendEnv(input: Record<string, unknown>): FrontendEnv {
  const parsed = envSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid environment variables')
  return parsed.data
}

export const env = parseFrontendEnv(process.env)
