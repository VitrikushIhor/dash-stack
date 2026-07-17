import { FormLogoUpload } from '@/shared/ui'
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
import { useCreateOrganizationForm } from '../model/forms/use-create-organization-form'

interface CreateOrganizationFormProps {
  onSuccess?: () => void
  submitLabel?: string
  className?: string
}

export const CreateOrganizationForm = ({
  onSuccess,
  submitLabel = 'Create',
  className,
}: CreateOrganizationFormProps) => {
  const { form, onSubmit, isPending } = useCreateOrganizationForm({ onSuccess })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-4 ${className || ''}`}
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Acme Inc.' {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us about your organization...'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLogoUpload
          name='logoFile'
          label='Organization Logo'
          className='w-full'
        />
        <div className='flex justify-end pt-2'>
          <Button
            type='submit'
            disabled={isPending}
            className='w-full sm:w-auto'
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
