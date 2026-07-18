import { showSubmittedData } from '@/shared/lib/show-submitted-data'
import { Button } from '@/shared/ui/core/button'
import { Form } from '@/shared/ui/core/form'
import { useProfileForm } from '../lib/use-profile-form'
import type { ProfileFormValues } from '../model/profile.schema'
import { ProfileFormElements } from './profile-form-elements'

export function UpdateProfileForm() {
  const { form, fields, append } = useProfileForm()

  function onSubmit(data: ProfileFormValues) {
    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <ProfileFormElements form={form} fields={fields} append={append} />
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
