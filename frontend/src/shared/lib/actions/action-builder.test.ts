import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { ApiError } from '@/shared/api'
import { createAction } from './action-builder'

describe('createAction', () => {
  it('successfully validates input and returns result data in ActionState', async () => {
    const testSchema = z.object({
      name: z.string().min(2),
    })

    const action = createAction(testSchema, async (input) => {
      return { greeting: `Hello, ${input.name}!` }
    })

    const result = await action({ name: 'Alice' })
    expect(result).toEqual({
      success: true,
      data: { greeting: 'Hello, Alice!' },
    })
  })

  it('handles Zod validation errors and returns formatted messages', async () => {
    const testSchema = z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
    })

    const action = createAction(testSchema, async (input) => {
      return input
    })

    const result = await action({ name: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Validation failed')
      expect(result.validationMessages).toContain(
        'Name must be at least 3 characters'
      )
    }
  })

  it('handles ApiError with custom validation messages', async () => {
    const testSchema = z.object({
      id: z.string(),
    })

    const action = createAction(testSchema, async () => {
      throw new ApiError(400, 'Invalid request', {
        statusCode: 400,
        error: 'Bad Request',
        message: ['Field X is required'],
      })
    })

    const result = await action({ id: '123' })
    expect(result).toEqual({
      success: false,
      error: 'Invalid request',
      validationMessages: ['Field X is required'],
    })
  })

  it('handles standard Errors gracefully', async () => {
    const testSchema = z.object({
      id: z.string(),
    })

    const action = createAction(testSchema, async () => {
      throw new Error('Something went wrong')
    })

    const result = await action({ id: '123' })
    expect(result).toEqual({
      success: false,
      error: 'Something went wrong',
    })
  })

  it('supports actions without input schema', async () => {
    const action = createAction(async () => {
      return { status: 'ok' }
    })

    const result = await action()
    expect(result).toEqual({
      success: true,
      data: { status: 'ok' },
    })
  })
})
