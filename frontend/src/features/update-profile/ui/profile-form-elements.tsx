import type { UseFormReturn } from 'react-hook-form'
import { User, Mail, Link as LinkIcon, FileText } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { DatePicker, FormAvatarUpload } from '@/shared/ui'
import { Button } from '@/shared/ui/core/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import { Textarea } from '@/shared/ui/core/textarea'
import type { ProfileFormValues } from '../model/profile.schema'

interface ProfileFormElementsProps {
  form: UseFormReturn<ProfileFormValues>
  fields: Record<'id', string>[]
  append: (value: { value: string }) => void
}

export function ProfileFormElements({
  form,
  fields,
  append,
}: ProfileFormElementsProps) {
  return (
    <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
      {/* Left Block: Identity & Contact */}
      <div className='space-y-8'>
        {/* Avatar Section */}
        <div className='bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed p-6'>
          <FormAvatarUpload
            name='avatar'
            label='Profile Picture'
            maxSize={1024 * 1024 * 5}
          />
          <p className='text-muted-foreground max-w-sm text-center text-xs'>
            Allowed formats: JPG, PNG, GIF. Max file size: 5MB.
          </p>
        </div>

        {/* Personal Details */}
        <div className='space-y-6'>
          <h3 className='flex items-center gap-2 border-b pb-2 text-lg font-medium'>
            <User className='text-primary h-4 w-4' />
            Personal Details
          </h3>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact & Identity */}
        <div className='space-y-6'>
          <h3 className='flex items-center gap-2 border-b pb-2 text-lg font-medium'>
            <Mail className='text-primary h-4 w-4' />
            Contact & Identity
          </h3>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='john.doe@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your primary email for notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dob'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Date of Birth</FormLabel>
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                  <FormDescription>
                    Used for age-restricted content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Right Block: Content & Social */}
      <div className='space-y-8'>
        {/* Bio */}
        <div className='space-y-6'>
          <h3 className='flex items-center gap-2 border-b pb-2 text-lg font-medium'>
            <FileText className='text-primary h-4 w-4' />
            About You
          </h3>

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself...'
                    className='min-h-[160px] resize-none'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Brief description for your profile. Maximum 160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Social Links */}
        <div className='space-y-6'>
          <h3 className='flex items-center gap-2 border-b pb-2 text-lg font-medium'>
            <LinkIcon className='text-primary h-4 w-4' />
            Social Links
          </h3>

          <div className='space-y-4'>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`urls.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      URLs
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only')}>
                      Add links to your website or blog.
                    </FormDescription>
                    <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                      <Input placeholder='https://example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type='button'
              variant='secondary'
              size='sm'
              className='mt-2 w-full'
              onClick={() => append({ value: '' })}
            >
              Add URL
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
