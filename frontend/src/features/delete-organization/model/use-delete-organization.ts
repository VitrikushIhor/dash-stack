'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleServerError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { deleteOrganizationAction } from '../api/delete-organization.action'

interface UseDeleteOrganizationOptions {
  redirectTo?: string
  onSuccess?: () => void
}

export const useDeleteOrganization = (
  options: UseDeleteOrganizationOptions = {}
) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const deleteOrganization = async (slug: string): Promise<boolean> => {
    setIsDeleting(true)

    try {
      const result = await deleteOrganizationAction(slug)

      if (!result.success) {
        handleServerError(
          result.validationMessages?.length
            ? result.validationMessages
            : result.error
        )
        return false
      }

      toast.success('Organization deleted successfully')
      options.onSuccess?.()

      const targetPath = options.redirectTo ?? ROUTES.organizations
      router.push(targetPath)
      return true
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteOrganization,
    isPending: isDeleting,
  }
}
