'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type User } from '@/entities/user'
import {
  type UpdateProfileFormValues,
  UpdateProfileSchema,
} from './update-profile.schema'
import { useUpdateProfile } from './use-update-profile'

interface UseUpdateProfileFormProps {
  onSuccess?: () => void
}

function parseDob(dobString?: string | null): Date | undefined {
  if (!dobString) return undefined
  const [year, month, day] = dobString.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export const useUpdateProfileForm = (
  user?: User | null,
  options: UseUpdateProfileFormProps = {}
) => {
  const { updateProfile, isPending } = useUpdateProfile()

  const defaultValues: Partial<UpdateProfileFormValues> = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    bio: user?.bio ?? '',
    dob: parseDob(user?.dob),
    urls: user?.urls?.map((url) => ({ value: url })) ?? [],
    avatar: user?.avatar
      ? { kind: 'key', value: user.avatar }
      : { kind: 'none' },
  }

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  const onSubmit = async (values: UpdateProfileFormValues) => {
    if (!user) return
    await updateProfile(user, values, {
      onSuccess: () => {
        form.reset(values)
        options.onSuccess?.()
      },
    })
  }

  return {
    form,
    fields,
    append,
    remove,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDirty: !form.formState.isDirty,
  }
}
