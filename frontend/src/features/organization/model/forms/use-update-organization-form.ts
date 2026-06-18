import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileFromKey, type FileWithServerData } from '@/shared/api'
import {
  useUpdateOrganization,
  type Organization,
} from '@/entities/organization'
import {
  UpdateOrgSchema,
  type UpdateOrgFormValues,
} from '../schema/organization-schema'

export const useUpdateOrganizationForm = (organization: Organization) => {
  const { mutate: updateOrg, isPending } = useUpdateOrganization()

  const defaultFiles = organization.logo
    ? [createFileFromKey(organization.logo)]
    : []

  const form = useForm<UpdateOrgFormValues>({
    resolver: zodResolver(UpdateOrgSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description || '',
      logo: organization.logo || '',
      files: defaultFiles,
    },
  })

  const onSubmit = (values: UpdateOrgFormValues) => {
    let logoUrl = values.logo || ''

    if (values.files && values.files.length > 0) {
      const file = values.files[0] as FileWithServerData
      logoUrl = file.s3Url || file.s3Key || logoUrl
    } else if (values.files?.length === 0) {
      logoUrl = ''
    }

    const dto = {
      name: values.name,
      description: values.description,
      logo: logoUrl,
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
