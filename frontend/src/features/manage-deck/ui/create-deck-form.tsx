'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { DialogFooter } from '@/shared/ui/core/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/core/select'
import { Textarea } from '@/shared/ui/core/textarea'
import { CEFRLevelEnum, DeckVisibilityEnum } from '@/entities/deck'
import { useCreateDeckForm } from '../model/use-create-deck-form'

export function CreateDeckForm() {
  const { form, onSubmit, isPending, closeDialog } = useCreateDeckForm()
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentTags: string[],
    onChange: (tags: string[]) => void
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '')
      if (trimmed && !currentTags.includes(trimmed)) {
        onChange([...currentTags, trimmed])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (
    tagToRemove: string,
    currentTags: string[],
    onChange: (tags: string[]) => void
  ) => {
    onChange(currentTags.filter((t) => t !== tagToRemove))
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='space-y-4 py-2'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-semibold'>
                Deck Title <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g. Cambridge C1 Advanced Phrasal Verbs'
                  {...field}
                />
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
                <Textarea
                  placeholder='e.g. Essential phrasal verbs for CAE and everyday native conversations.'
                  rows={3}
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='level'
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEFR Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select level' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(CEFRLevelEnum).map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl} Level
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='visibility'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select visibility' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DeckVisibilityEnum.PRIVATE}>
                      Private (Only you)
                    </SelectItem>
                    <SelectItem value={DeckVisibilityEnum.PUBLIC}>
                      Public (Discoverable)
                    </SelectItem>
                    <SelectItem value={DeckVisibilityEnum.UNLISTED}>
                      Unlisted (Direct link)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags Input */}
        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder='Type tag and press Enter...'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    handleAddTag(e, field.value || [], field.onChange)
                  }
                  className='mt-1'
                />
              </FormControl>
              <FormDescription className='text-xs'>
                Press Enter or comma to add tags.
              </FormDescription>

              {(field.value?.length || 0) > 0 && (
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {field.value.map((tag: string) => (
                    <span
                      key={tag}
                      className='bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium'
                    >
                      #{tag}
                      <button
                        type='button'
                        onClick={() =>
                          handleRemoveTag(tag, field.value, field.onChange)
                        }
                        className='text-muted-foreground hover:text-foreground ml-1'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className='pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={closeDialog}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              'Create & Add Cards'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
