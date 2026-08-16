'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { handleServerError, resolveLogoUrl, useUploadImage } from '@/shared/api'
import type {
  Organization,
  UpdateOrganizationDto,
} from '@/entities/organization'
import { updateOrganizationAction } from '../api/update-organization.action'
import type { UpdateOrgFormValues } from './update-organization.schema'

export const useUpdateOrganization = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const uploadImage = useUploadImage()

  const updateOrganization = async (
    organization: Organization,
    values: UpdateOrgFormValues,
    options?: { onSuccess?: () => void }
  ): Promise<boolean> => {
    setIsSubmitting(true)

    try {
      let logoUrl: string | null = null

      try {
        logoUrl = await resolveLogoUrl(
          values.logoFile,
          values.logo || undefined,
          uploadImage.mutateAsync
        )
      } catch (err) {
        handleServerError(err)
        return false
      }

      const dto: UpdateOrganizationDto = {}

      if (values.name !== organization.name) {
        dto.name = values.name
      }

      const descValue =
        values.description === '' ? null : (values.description ?? null)
      const orgDesc = organization.description ?? null
      if (descValue !== orgDesc) {
        dto.description = descValue
      }

      if (logoUrl !== (organization.logo ?? null) && logoUrl !== undefined) {
        dto.logo = logoUrl
      }

      if (Object.keys(dto).length === 0) {
        toast.success('Organization updated successfully!')
        options?.onSuccess?.()
        return true
      }

      const result = await updateOrganizationAction(organization.id, dto)

      if (!result.success) {
        handleServerError(
          result.validationMessages?.length
            ? result.validationMessages
            : result.error
        )
        return false
      }

      toast.success('Organization updated successfully!')
      options?.onSuccess?.()
      return true
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    updateOrganization,
    isPending: isSubmitting || uploadImage.isPending,
  }
}
