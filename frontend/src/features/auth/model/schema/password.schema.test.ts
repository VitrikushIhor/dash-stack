import { describe, expect, it } from 'vitest'
import { passwordSchema } from './password.schema'

describe('passwordSchema', () => {
  it('accepts a password containing exactly 72 UTF-8 bytes', () => {
    expect(passwordSchema.safeParse('é'.repeat(36)).success).toBe(true)
  })

  it('rejects a password containing more than 72 UTF-8 bytes', () => {
    expect(passwordSchema.safeParse('é'.repeat(37)).success).toBe(false)
  })

  it('rejects 73 ASCII bytes', () => {
    expect(passwordSchema.safeParse('a'.repeat(73)).success).toBe(false)
  })
})
