'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { handleServerError, useUploadImage } from '@/shared/api'
import type { UpdateUserDto, User } from '@/entities/user'
import { updateProfileAction } from '../api/update-profile.action'
import type {
  AvatarValue,
  UpdateProfileFormValues,
} from './update-profile.schema'

export const useUpdateProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const avatarUpload = useUploadImage()

  const resolveAvatarKey = async (
    avatar: AvatarValue
  ): Promise<string | null> => {
    switch (avatar.kind) {
      case 'file': {
        const { key } = await avatarUpload.mutateAsync(avatar.value)
        return key
      }
      case 'key':
        return avatar.value
      case 'none':
        return null
    }
  }

  const updateProfile = async (
    user: User,
    values: UpdateProfileFormValues,
    options?: { onSuccess?: () => void }
  ): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      let avatarKey: string | null = null

      try {
        avatarKey = await resolveAvatarKey(values.avatar)
      } catch (err) {
        handleServerError(err)
        return false
      }

      const dto: UpdateUserDto = {}

      if (values.firstName !== user.firstName) {
        dto.firstName = values.firstName
      }

      const userLastName = user.lastName ?? ''
      if (values.lastName !== userLastName) {
        dto.lastName = values.lastName
      }

      if (values.email !== user.email) {
        dto.email = values.email
      }

      const bioVal = values.bio?.trim() ? values.bio.trim() : null
      const userBio = user.bio ?? null
      if (bioVal !== userBio) {
        dto.bio = bioVal
      }

      const dobVal = values.dob ? format(values.dob, 'yyyy-MM-dd') : null
      const userDob = user.dob ?? null
      if (dobVal !== userDob) {
        dto.dob = dobVal
      }

      const userAvatar = user.avatar ?? null
      if (avatarKey !== userAvatar) {
        dto.avatar = avatarKey
      }

      const newUrls = values.urls?.map((u) => u.value) ?? []
      const userUrls = user.urls ?? []
      const urlsChanged =
        newUrls.length !== userUrls.length ||
        newUrls.some((u, i) => u !== userUrls[i])
      if (urlsChanged) {
        dto.urls = newUrls
      }

      if (Object.keys(dto).length === 0) {
        toast.success('Profile updated successfully.')
        options?.onSuccess?.()
        return true
      }

      const result = await updateProfileAction(dto)

      if (!result.success) {
        handleServerError(
          result.validationMessages?.length
            ? result.validationMessages
            : result.error
        )
        return false
      }

      toast.success('Profile updated successfully.')
      options?.onSuccess?.()
      return true
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    updateProfile,
    isPending: isSubmitting || avatarUpload.isPending,
  }
}
