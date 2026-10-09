import { z } from 'zod'
import { createHash } from 'node:crypto'
import { ROUTES } from '@/shared/config'

export const OAUTH_LINK_CONNECTIONS = {
  'google-oauth2': 'google',
  github: 'github',
} as const

export const oauthLinkFlowSchema = z
  .object({
    verifier: z.string().regex(/^[A-Za-z0-9_-]{43,128}$/),
    sessionHash: z.string().regex(/^[a-f0-9]{64}$/),
    provider: z.enum(['google', 'github']),
    returnTo: z.enum([ROUTES.settingsAccounts, ROUTES.vocabSettingsAccounts]),
  })
  .strict()

export function sessionBinding(credential: string): string {
  return createHash('sha256').update(credential).digest('hex')
}
