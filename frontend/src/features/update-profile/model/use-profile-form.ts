import { format } from 'date-fns'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useUploadImage } from '@/shared/api'
import { type User } from '@/entities/user'
import {
  profileFormSchema,
  defaultProfileValues,
  type ProfileFormValues,
  type AvatarValue,
} from './profile.schema'
import { useUpdateProfile } from './use-update-profile'

interface UseProfileFormProps {
  user?: User
}

export function useProfileForm({ user }: UseProfileFormProps = {}) {
  const updateMutation = useUpdateProfile()
  const avatarUpload = useUploadImage()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: user
      ? {
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? '',
          bio: user.bio ?? defaultProfileValues.bio,
          dob: user.dob ? new Date(user.dob) : undefined,
          urls: user.urls?.length
            ? user.urls.map((url) => ({ value: url }))
            : defaultProfileValues.urls,
          avatar: user.avatar
            ? { kind: 'key', value: user.avatar }
            : { kind: 'none' },
        }
      : defaultProfileValues,
    mode: 'onTouched',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const avatarKey = await resolveAvatarKey(data.avatar)

      await updateMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        bio: data.bio,
        dob: data.dob ? format(data.dob, 'yyyy-MM-dd') : null,
        urls: data.urls?.map((u) => u.value) ?? [],
        avatar: avatarKey,
      })

      toast.success('Profile updated successfully.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update profile.'
      toast.error(message)
    }
  }

  return {
    form,
    fields,
    append,
    remove,
    onSubmit,
    isLoading: updateMutation.isPending || avatarUpload.isPending,
  }
}
