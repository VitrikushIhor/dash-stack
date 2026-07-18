import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi, userKeys, type User } from '@/entities/user'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User> & { urls?: string[] }) =>
      userApi.updateMe(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.me(), updatedUser)
    },
  })
}
