'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useUploadImage, handleServerError, resolveLogoUrl } from '@/shared/api'
import { createOrganizationAction } from '../api/create-organization.action'
import type { CreateOrgFormValues } from './create-organization.schema'

export const useCreateOrganization = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const uploadImage = useUploadImage()

  const createOrganization = async (
    values: CreateOrgFormValues,
    options?: { onSuccess?: () => void }
  ): Promise<boolean> => {
    setIsSubmitting(true)

    try {
      let logoUrl: string | undefined = undefined

      try {
        const resolvedLogoUrl = await resolveLogoUrl(
          values.logoFile,
          values.logo || undefined,
          uploadImage.mutateAsync
        )
        logoUrl = resolvedLogoUrl || undefined
      } catch (err) {
        handleServerError(err)
        return false
      }

      const orgResult = await createOrganizationAction({
        name: values.name,
        description: values.description,
        logo: logoUrl,
      })

      if (!orgResult.success) {
        handleServerError(
          orgResult.validationMessages?.length
            ? orgResult.validationMessages
            : orgResult.error
        )
        return false
      }

      toast.success(`Organization ${values.name} created successfully!`)
      options?.onSuccess?.()
      return true
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    createOrganization,
    isPending: isSubmitting || uploadImage.isPending,
  }
}
