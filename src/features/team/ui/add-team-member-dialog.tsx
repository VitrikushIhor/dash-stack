'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { fileToBase64 } from '@/shared/lib/utils'
import { AvatarUpload } from '@/shared/ui/components/avatar-upload'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/components/ui/form'
import { Input } from '@/shared/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select'
import { TEAM_ROLES, USER_GENDER } from '@/entities/team'
import {
  defaultValues,
  memberFormSchema,
  type MemberForm,
} from '../model/add-member-schema'
import { useMemberStore } from '../model/member-store'

type UserActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ open, onOpenChange }: UserActionDialogProps) {
  const form = useForm<MemberForm>({
    resolver: zodResolver(memberFormSchema),
    defaultValues,
  })

  const addMember = useMemberStore((state) => state.addMember)

  const handleFileReject = (_file: File, message: string) => {
    toast.error(message)
  }

  const onSubmit = async (values: MemberForm) => {
    try {
      addMember({
        ...values,
        id: crypto.randomUUID(),
        avatar: await fileToBase64(values.avatar),
      })
      toast.success('Member added successfully', {})
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to add member')
      // eslint-disable-next-line no-console
      console.error('Error adding member:', error)
    }
  }

  const handleDialogOpenChange = (state: boolean) => {
    if (!state) {
      form.reset()
    }
    onOpenChange(state)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-center'>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Create new member here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='member-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-center space-y-1'>
                    <FormControl>
                      <AvatarUpload
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                        onFileReject={handleFileReject}
                        maxSize={2 * 1024 * 1024}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem className='flex flex-col space-y-1'>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John' autoComplete='off' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem className='flex flex-col space-y-1'>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Valentine'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='flex flex-col space-y-1'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='john.doe@gmail.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem className='flex flex-col space-y-1'>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select gender' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(USER_GENDER).map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position */}
              <FormField
                control={form.control}
                name='position'
                render={({ field }) => (
                  <FormItem className='flex flex-col space-y-1'>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select position' />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TEAM_ROLES).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='member-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
