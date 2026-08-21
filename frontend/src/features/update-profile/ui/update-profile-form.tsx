'use client'

import { Button } from '@/shared/ui/core/button'
import { Form } from '@/shared/ui/core/form'
import { type User } from '@/entities/user'
import { useUpdateProfileForm } from '../model/use-update-profile-form'
import { ProfileFormElements } from './profile-form-elements'

interface UpdateProfileFormProps {
  user: User
}

export function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const { form, fields, append, remove, onSubmit, isPending, isDirty } =
    useUpdateProfileForm(user)

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='space-y-8'>
        <ProfileFormElements
          form={form}
          fields={fields}
          append={append}
          remove={remove}
        />
        <div className='flex justify-end'>
          <Button type='submit' disabled={isPending || isDirty}>
            {isPending ? 'Saving...' : 'Update profile'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
