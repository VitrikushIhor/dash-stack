'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTheme } from '@/shared/lib/providers'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/core/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/core/radio-group'
import {
  appearanceFormSchema,
  type AppearanceFormValues,
} from '../model/appearance.schema'

const themes = [
  {
    value: 'light',
    label: 'Light',
    preview: (
      <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
        <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
          <div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
        </div>
        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
        </div>
        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
        </div>
      </div>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    preview: (
      <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
        <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
          <div className='h-2 w-[80px] rounded-lg bg-slate-400' />
          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
        </div>
        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
          <div className='h-4 w-4 rounded-full bg-slate-400' />
          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
        </div>
        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
          <div className='h-4 w-4 rounded-full bg-slate-400' />
          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
        </div>
      </div>
    ),
  },
  {
    value: 'system',
    label: 'System',
    preview: (
      <div className='space-y-2 rounded-sm bg-slate-900 p-2'>
        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
          <div className='h-4 w-4 rounded-full bg-slate-400' />
          <div className='h-2 w-[60px] rounded-lg bg-slate-400' />
        </div>
        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
          <div className='h-4 w-4 rounded-full bg-slate-300' />
          <div className='h-2 w-[60px] rounded-lg bg-slate-300' />
        </div>
      </div>
    ),
  },
] as const

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: { theme },
  })

  useEffect(() => {
    form.reset({ theme })
  }, [theme, form])

  function onSubmit(data: AppearanceFormValues) {
    if (data.theme !== theme) {
      setTheme(data.theme)
    }
    toast.success('Appearance preferences updated.')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <FormDescription>
                Select the theme for the dashboard.
              </FormDescription>
              <FormMessage />
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className='grid max-w-md grid-cols-3 gap-4 pt-2'
                >
                  {themes.map(({ value, label, preview }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer flex-col rounded-md border-2 p-1 transition-colors',
                        field.value === value
                          ? 'border-primary'
                          : 'border-muted hover:border-accent'
                      )}
                    >
                      <RadioGroupItem value={value} className='sr-only' />
                      <div className='flex-1 overflow-hidden rounded-sm'>
                        {preview}
                      </div>
                      <span className='block w-full p-2 text-center text-sm font-normal'>
                        {label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <Button type='submit'>Update preferences</Button>
      </form>
    </Form>
  )
}
