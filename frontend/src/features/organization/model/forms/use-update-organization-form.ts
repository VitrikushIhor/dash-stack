import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileFromKey, type FileWithServerData } from '@/shared/api'
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
  const { mutate: updateOrg, isPending } = useUpdateOrganization()

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

  const onSubmit = (values: UpdateOrgFormValues) => {
    let logoUrl = values.logo || ''

    if (values.logoFile) {
      const file = values.logoFile as FileWithServerData
      logoUrl = file.s3Url || file.s3Key || logoUrl
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

    updateOrg({
      orgId: organization.id,
      dto,
    })
  }

  return {
    form,
    onSubmit,
    isPending,
  }
}
