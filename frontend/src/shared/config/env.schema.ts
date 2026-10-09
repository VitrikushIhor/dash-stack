import { z } from 'zod'
import {
  isValidOAuthConfiguration,
  isValidProductionOrigin,
} from './env-validation'

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.url().optional(),
    NEXT_PUBLIC_AUTH0_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_AUTH0_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    API_URL: z.url().optional(),
    COOKIE_SECURE: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') return

    const appOrigin = value.NEXT_PUBLIC_APP_URL ?? value.FRONTEND_URL
    if (!appOrigin || !isValidProductionOrigin(appOrigin)) {
      context.addIssue({
        code: 'custom',
        path: ['NEXT_PUBLIC_APP_URL'],
        message: 'Valid app origin required in production',
      })
    }

    const domain = value.NEXT_PUBLIC_AUTH0_DOMAIN
    const clientId = value.NEXT_PUBLIC_AUTH0_CLIENT_ID
    const hasOAuthConfiguration = Boolean(domain || clientId)

    if (
      hasOAuthConfiguration &&
      !isValidOAuthConfiguration(
        domain,
        clientId,
        value.NEXT_PUBLIC_APP_URL ?? value.FRONTEND_URL
      )
    ) {
      context.addIssue({
        code: 'custom',
        path: ['NEXT_PUBLIC_AUTH0_DOMAIN'],
        message: 'Invalid OAuth configuration',
      })
    }

    if (!value.API_URL) {
      context.addIssue({
        code: 'custom',
        path: ['API_URL'],
        message: 'Required in production',
      })
    } else if (!isValidProductionOrigin(value.API_URL)) {
      context.addIssue({
        code: 'custom',
        path: ['API_URL'],
        message: 'HTTPS required',
      })
    }
  })
