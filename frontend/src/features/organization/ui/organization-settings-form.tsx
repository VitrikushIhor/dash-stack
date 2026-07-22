import { getFileUrl } from '@/shared/api'
import { Button } from '@/shared/ui/core/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import { Textarea } from '@/shared/ui/core/textarea'
import { FormLogoUpload } from '@/shared/ui/form-fields'
import { type Organization } from '@/entities/organization'
import { useUpdateOrganizationForm } from '../model/forms/use-update-organization-form'

interface OrganizationSettingsFormProps {
  organization: Organization
}

export const OrganizationSettingsForm = ({
  organization,
}: OrganizationSettingsFormProps) => {
  const { form, onSubmit, isPending } = useUpdateOrganizationForm(organization)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className='resize-none' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLogoUpload
          name='logoFile'
          label='Organization Logo'
          defaultPreview={getFileUrl(organization.logo)}
          className='w-full'
        />
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
