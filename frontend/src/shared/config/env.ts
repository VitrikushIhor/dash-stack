import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_AUTH0_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_AUTH0_CLIENT_ID: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  // eslint-disable-next-line no-console
  console.error(
    '❌ Invalid environment variables:',
    parsedEnv.error.flatten().fieldErrors
  )
  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data
