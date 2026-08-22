import { z } from 'zod'
import 'server-only'
import { type QueryResult, handleQueryError } from '@/shared/api'

type QueryHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>
type EmptyQueryHandler<TOutput> = () => Promise<TOutput>

export function createServerQuery<TInput, TOutput>(
  queryName: string,
  schema: z.ZodType<TInput>,
  handler: QueryHandler<TInput, TOutput>
): (input?: unknown) => Promise<QueryResult<TOutput>>

export function createServerQuery<TOutput>(
  queryName: string,
  handler: EmptyQueryHandler<TOutput>
): () => Promise<QueryResult<TOutput>>

export function createServerQuery<TInput, TOutput>(
  queryName: string,
  schemaOrHandler: z.ZodType<TInput> | EmptyQueryHandler<TOutput>,
  maybeHandler?: QueryHandler<TInput, TOutput>
) {
  if (typeof schemaOrHandler === 'function') {
    const handler = schemaOrHandler
    return async (): Promise<QueryResult<TOutput>> => {
      try {
        const data = await handler()
        return { ok: true, data }
      } catch (error) {
        return handleQueryError(error, queryName)
      }
    }
  }

  const schema = schemaOrHandler
  const handler = maybeHandler!

  return async (input?: unknown): Promise<QueryResult<TOutput>> => {
    const parsed = schema.safeParse(input)

    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION',
          message: `Invalid arguments for ${queryName}`,
          details: z.flattenError(parsed.error).fieldErrors,
        },
      }
    }

    try {
      const data = await handler(parsed.data)
      return { ok: true, data }
    } catch (error) {
      return handleQueryError(error, queryName)
    }
  }
}
