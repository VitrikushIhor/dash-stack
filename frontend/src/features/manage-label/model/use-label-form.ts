'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from '@/shared/lib'
import {
  type CreateLabelDto,
  CreateLabelDtoSchema,
  type LabelDto,
} from '@/entities/label'
import { createLabelAction } from '../api/create-label.action'
import { updateLabelAction } from '../api/update-label.action'

interface UseLabelFormProps {
  initialData?: LabelDto | null
  onSuccess?: () => void
}

export const useLabelForm = ({
  initialData,
  onSuccess,
}: UseLabelFormProps = {}) => {
  const router = useRouter()

  const handleSuccess = () => {
    onSuccess?.()
    router.refresh()
  }

  const { execute: createLabel, isPending: isCreating } = useAction(
    createLabelAction,
    {
      successMessage: 'Label created successfully!',
      onSuccess: handleSuccess,
    }
  )

  const { execute: updateLabel, isPending: isUpdating } = useAction(
    updateLabelAction,
    {
      successMessage: 'Label updated successfully!',
      onSuccess: handleSuccess,
    }
  )

  const isPending = isCreating || isUpdating

  const form = useForm<CreateLabelDto>({
    resolver: zodResolver(CreateLabelDtoSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || 'gray',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (initialData) {
      await updateLabel({ id: initialData.id, dto: values })
    } else {
      await createLabel(values)
    }
  })

  return {
    form,
    onSubmit,
    isPending,
  }
}
