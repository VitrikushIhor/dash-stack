import { api } from '@/shared/api'
import { type User } from '../model/types'

export const sessionApi = {
  getMe: (): Promise<User> => {
    return api.get<User>('/auth/me')
  },
}
