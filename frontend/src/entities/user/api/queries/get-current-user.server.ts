import { cache } from 'react'
import 'server-only'
import { ApiError, getErrorMessage } from '@/shared/api'
import { type User } from '../../model/types'
import { userServerApi } from '../user-api.server'

type GetCurrentUserResponse = {
  data: User | null
  error: string | null
  statusCode: number | null
}

export const getCurrentUser = cache(
  async (): Promise<GetCurrentUserResponse> => {
    try {
      const data = await userServerApi.getMe()
      return { data, error: null, statusCode: null }
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
        statusCode: error instanceof ApiError ? error.statusCode : null,
      }
    }
  }
)
