'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ROUTES } from '@/shared/config'
import {
  type CreateOrgFormValues,
  CreateOrgSchema,
} from './create-organization.schema'
import { useCreateOrganization } from './use-create-organization'

const defaultValues: CreateOrgFormValues = {
  name: '',
  description: '',
  logo: '',
  logoFile: null,
}

interface UseCreateOrganizationFormProps {
  onSuccess?: () => void
}

export const useCreateOrganizationForm = ({
  onSuccess,
}: UseCreateOrganizationFormProps = {}) => {
  const router = useRouter()
  const { createOrganization, isPending } = useCreateOrganization()

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues,
  })

  const onSubmit = async (values: CreateOrgFormValues) => {
    await createOrganization(values, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
        router.replace(ROUTES.organizations)
      },
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
  }
}
