import { z } from 'zod'

export const PASSWORD_MAX_BYTES = 72
export const PASSWORD_MAX_BYTES_MESSAGE =
  'Password must not exceed 72 bytes when encoded as UTF-8'

interface PasswordMessages {
  required: string
  minimum: string
}

const DEFAULT_PASSWORD_MESSAGES: PasswordMessages = {
  required: 'Please enter your password',
  minimum: 'Password must be at least 8 characters long',
}

export function createPasswordSchema(
  messages: PasswordMessages = DEFAULT_PASSWORD_MESSAGES
) {
  return z
    .string()
    .min(1, messages.required)
    .min(8, messages.minimum)
    .refine(
      (password) =>
        new TextEncoder().encode(password).byteLength <= PASSWORD_MAX_BYTES,
      PASSWORD_MAX_BYTES_MESSAGE
    )
}

export const passwordSchema = createPasswordSchema()
