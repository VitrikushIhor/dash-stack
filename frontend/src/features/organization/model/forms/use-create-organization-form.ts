'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useUploadImage, handleServerError } from '@/shared/api'
import { createOrganizationAction } from '../../api/actions/create-organization.action'
import {
  CreateOrgSchema,
  type CreateOrgFormValues,
} from '../schema/organization-schema'

interface UseCreateOrganizationFormProps {
  onSuccess?: () => void
}

export const useCreateOrganizationForm = ({
  onSuccess,
}: UseCreateOrganizationFormProps = {}) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const uploadImage = useUploadImage()

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      logoFile: null,
    },
  })

  const onSubmit = async (values: CreateOrgFormValues) => {
    let logoUrl = values.logo || undefined

    if (values.logoFile) {
      try {
        const res = await uploadImage.mutateAsync(values.logoFile)
        logoUrl = res.url
      } catch (err) {
        handleServerError(err)
        return
      }
    }

    startTransition(async () => {
      const payload = {
        name: values.name,
        description: values.description,
        logo: logoUrl,
      }

      const orgResult = await createOrganizationAction(payload)

      if (!orgResult.success) {
        if (orgResult.validationMessages?.length) {
          toast.error(orgResult.validationMessages[0])
        } else {
          toast.error(orgResult.error)
        }
        return
      }

      form.reset()
      toast.success(`Organization ${values.name} created successfully!`)
      onSuccess?.()
      router.replace('/organizations')
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending: isPending || uploadImage.isPending,
  }
}
