import { api } from '@/shared/api'
import { type User } from '../model/types'

export const userApi = {
  getMe: (): Promise<User> => {
    return api.get<User>('/me')
  },
  updateMe: (data: Partial<User> & { urls?: string[] }): Promise<User> => {
    return api.patch<User>('/me', data)
  },
}
