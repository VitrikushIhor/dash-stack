import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateOrganization } from '../../api/hooks/use-create-organization'
import {
  CreateOrgSchema,
  type CreateOrgFormValues,
} from '../../model/schema/organization-schema'

interface UseCreateOrganizationFormProps {
  onSuccess?: () => void
}

export const useCreateOrganizationForm = ({
  onSuccess,
}: UseCreateOrganizationFormProps = {}) => {
  const { mutate: createOrg, isPending } = useCreateOrganization()

  const form = useForm<CreateOrgFormValues>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = (values: CreateOrgFormValues) => {
    createOrg(values, {
      onSuccess: () => {
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
