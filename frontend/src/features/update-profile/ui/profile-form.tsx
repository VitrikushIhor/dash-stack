import { Button } from '@/shared/ui/core/button'
import { Form } from '@/shared/ui/core/form'
import { type User } from '@/entities/user'
import { useProfileForm } from '../model/use-profile-form'
import { ProfileFormElements } from './profile-form-elements'

interface UpdateProfileFormProps {
  user: User
}

export function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const { form, fields, append, remove, onSubmit, isLoading } = useProfileForm({
    user,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <ProfileFormElements
          form={form}
          fields={fields}
          append={append}
          remove={remove}
        />
        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update profile'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
