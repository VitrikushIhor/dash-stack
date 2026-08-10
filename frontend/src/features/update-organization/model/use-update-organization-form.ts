'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Organization } from '@/entities/organization'
import {
  UpdateOrgSchema,
  type UpdateOrgFormValues,
} from './update-organization.schema'
import { useUpdateOrganization } from './use-update-organization'

interface UseUpdateOrganizationFormProps {
  onSuccess?: () => void
}

export const useUpdateOrganizationForm = (
  organization: Organization,
  options: UseUpdateOrganizationFormProps = {}
) => {
  const { updateOrganization, isPending } = useUpdateOrganization()

  const form = useForm<UpdateOrgFormValues>({
    resolver: zodResolver(UpdateOrgSchema),
    defaultValues: {
      name: organization.name,
      description: organization.description ?? '',
      logo: organization.logo ?? '',
      logoFile: undefined,
    },
  })

  const onSubmit = async (values: UpdateOrgFormValues) => {
    await updateOrganization(organization, values, {
      onSuccess: options.onSuccess,
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDirty: !form.formState.isDirty,
  }
}
