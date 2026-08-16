import { z } from 'zod'
import { getErrorMessage, ApiError, type ActionState } from '@/shared/api'

type ActionHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>

export function createAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: ActionHandler<TInput, TOutput>
): (input: TInput) => Promise<ActionState<TOutput>>

export function createAction<TOutput>(
  handler: () => Promise<TOutput>
): () => Promise<ActionState<TOutput>>

export function createAction<TInput, TOutput>(
  schemaOrHandler: z.ZodType<TInput> | (() => Promise<TOutput>),
  maybeHandler?: ActionHandler<TInput, TOutput>
) {
  if (typeof schemaOrHandler === 'function') {
    const handler = schemaOrHandler
    return async (): Promise<ActionState<TOutput>> => {
      try {
        const res = await handler()
        return { success: true, data: res }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            success: false,
            error: 'Validation failed',
            validationMessages: error.issues.map((e) => e.message),
          }
        }
        if (error instanceof ApiError) {
          return {
            success: false,
            error: error.message,
            validationMessages: error.validationMessages,
          }
        }
        return { success: false, error: getErrorMessage(error) }
      }
    }
  }

  const schema = schemaOrHandler
  const handler = maybeHandler!

  return async (input: TInput): Promise<ActionState<TOutput>> => {
    try {
      const validDto = schema.parse(input)
      const res = await handler(validDto)

      return { success: true, data: res }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          validationMessages: error.issues.map((e) => e.message),
        }
      }
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          validationMessages: error.validationMessages,
        }
      }
      return { success: false, error: getErrorMessage(error) }
    }
  }
}
