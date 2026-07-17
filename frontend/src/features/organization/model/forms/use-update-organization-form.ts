import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createFileFromKey,
  type FileWithServerData,
  storageApi,
} from '@/shared/api'
import { handleServerError } from '@/shared/lib/handle-server-error'
import {
  useUpdateOrganization,
  type Organization,
  type UpdateOrganizationDto,
} from '@/entities/organization'
import {
  UpdateOrgSchema,
  type UpdateOrgFormValues,
} from '../schema/organization-schema'

export const useUpdateOrganizationForm = (organization: Organization) => {
  const { mutate: updateOrg, isPending: isUpdating } = useUpdateOrganization()
  const [isUploading, setIsUploading] = useState(false)

  const defaultFile = organization.logo
    ? createFileFromKey(organization.logo)
    : null

  const form = useForm<UpdateOrgFormValues>({
    resolver: zodResolver(UpdateOrgSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description || '',
      logo: organization.logo || '',
      logoFile: defaultFile,
    },
  })

  const onSubmit = async (values: UpdateOrgFormValues) => {
    let logoUrl = values.logo || ''

    if (values.logoFile) {
      const file = values.logoFile as FileWithServerData
      if (file.s3Url || file.s3Key) {
        logoUrl = file.s3Url || file.s3Key || logoUrl
      } else {
        try {
          setIsUploading(true)
          const res = await storageApi.uploadImage(file)
          logoUrl = res.url
        } catch (err) {
          handleServerError(err)
          setIsUploading(false)
          return
        }
      }
    } else if (values.logoFile === null) {
      logoUrl = ''
    }

    const dto: UpdateOrganizationDto = {
      name: values.name,
    }

    if (values.description !== undefined) {
      dto.description = values.description === '' ? null : values.description
    }

    if (logoUrl) {
      dto.logo = logoUrl
    } else if (values.logoFile === null) {
      dto.logo = null
    }

    updateOrg(
      {
        orgId: organization.id,
        dto,
      },
      {
        onSettled: () => setIsUploading(false),
      }
    )
  }

  return {
    form,
    onSubmit,
    isPending: isUpdating || isUploading,
  }
}
