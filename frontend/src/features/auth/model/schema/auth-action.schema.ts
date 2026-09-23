import { z } from 'zod'
import { resetPasswordSchema } from './reset-password.schema'

const TokenSchema = z.string().min(1, 'Token is required')

export const OAuthExchangeInputSchema = z.object({ token: TokenSchema })

export const VerifyEmailInputSchema = z.object({ token: TokenSchema })

export const ResetPasswordInputSchema = resetPasswordSchema.and(
  z.object({ token: TokenSchema })
)
