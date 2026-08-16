import { z } from 'zod'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import type { OrganizationSummary } from '../model/types/organization.types'
import { getActiveOrganization } from './queries/get-active-organization.server'

type OrgActionHandler<TInput, TOutput> = (
  input: TInput,
  ctx: { activeOrg: OrganizationSummary }
) => Promise<TOutput>

export function createOrgAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: OrgActionHandler<TInput, TOutput>
) {
  return async (input: TInput): Promise<ActionState<TOutput>> => {
    try {
      const { activeOrg } = await getActiveOrganization()
      if (!activeOrg) {
        throw new Error('Organization not found')
      }

      const validDto = schema.parse(input)
      const res = await handler(validDto, { activeOrg })

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
