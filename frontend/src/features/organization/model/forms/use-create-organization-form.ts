import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateOrganization } from '../mutations/use-create-organization'
import {
  CreateOrgSchema,
  type CreateOrgFormValues,
} from '../schema/organization-schema'
import { useOrgStore } from '../store/organization-store'

interface UseCreateOrganizationFormProps {
  onSuccess?: () => void
}

export const useCreateOrganizationForm = ({
  onSuccess,
}: UseCreateOrganizationFormProps = {}) => {
  const { mutate: createOrg, isPending } = useCreateOrganization()
  const { setActiveOrgId } = useOrgStore()

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = (values: CreateOrgFormValues) => {
    createOrg(values, {
      onSuccess: (org) => {
        setActiveOrgId(org.id)
        form.reset()
        onSuccess?.()
      },
    })
  }

  return {
    form,
    onSubmit,
    isPending,
  }
}
