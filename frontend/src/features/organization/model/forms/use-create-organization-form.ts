import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUploadImage } from '@/shared/api'
import { handleServerError } from '@/shared/lib/handle-server-error'
import {
  useCreateOrganization,
  useActiveOrganization,
} from '@/entities/organization'
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
  const { setActiveOrgId } = useActiveOrganization()
  const uploadImage = useUploadImage()

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
    let logoUrl = values.logo || undefined

    if (values.logoFile) {
      try {
        const res = await uploadImage.mutateAsync(values.logoFile)
        logoUrl = res.url
      } catch (err) {
        handleServerError(err)
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
        setActiveOrgId(org.id)
        form.reset()
        onSuccess?.()
      },
      onError: (err) => {
        handleServerError(err)
      },
    })
  }

  return {
    form,
    onSubmit,
    isPending: isCreating || uploadImage.isPending,
  }
}
