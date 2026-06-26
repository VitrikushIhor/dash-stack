import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { storageApi } from '@/shared/api'
import { useCreateOrganization, useOrgStore } from '@/entities/organization'
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
  const { mutate: createOrg, isPending: isCreating } = useCreateOrganization()
  const { setActiveOrgId } = useOrgStore()
  const [isUploading, setIsUploading] = useState(false)

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
    let logoUrl = values.logo || ''

    if (values.logoFile) {
      try {
        setIsUploading(true)
        const res = await storageApi.uploadImage(values.logoFile)
        logoUrl = res.url
      } catch (_err) {
        setIsUploading(false)
        return
      }
    }

    const payload = {
      name: values.name,
      description: values.description,
      logo: logoUrl,
    }

    createOrg(payload, {
      onSuccess: (org) => {
        setIsUploading(false)
        setActiveOrgId(org.id)
        form.reset()
        onSuccess?.()
      },
      onError: () => {
        setIsUploading(false)
      },
    })
  }

  return {
    form,
    onSubmit,
    isPending: isCreating || isUploading,
  }
}
