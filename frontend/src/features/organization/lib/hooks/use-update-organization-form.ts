import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateOrganization } from '../../api/hooks/use-update-organization'
import {
  UpdateOrgSchema,
  type UpdateOrgFormValues,
} from '../../model/schema/organization-schema'
import { type Organization } from '../../model/types/organization.types'

export const useUpdateOrganizationForm = (organization: Organization) => {
  const { mutate: updateOrg, isPending } = useUpdateOrganization()

  const form = useForm<UpdateOrgFormValues>({
    resolver: zodResolver(UpdateOrgSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description || '',
      logo: organization.logo || '',
    },
  })

  const onSubmit = (values: UpdateOrgFormValues) => {
    updateOrg({
      orgId: organization.id,
      dto: values,
    })
  }

  return {
    form,
    onSubmit,
    isPending,
  }
}
