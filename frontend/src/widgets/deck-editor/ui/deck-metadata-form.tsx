import React from 'react'
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
import { type useDeckMetadata } from '../model/use-deck-metadata'

interface DeckMetadataFormProps {
  state: ReturnType<typeof useDeckMetadata>
}

export function DeckMetadataForm({ state }: DeckMetadataFormProps) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    level,
    setLevel,
    visibility,
    setVisibility,
  } = state
  return (
    <div className='border-border/70 bg-card/60 rounded-2xl border p-6 shadow-sm backdrop-blur-sm'>
      <div className='space-y-4'>
        <div>
          <label className='text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase'>
            Deck Title <span className='text-destructive'>*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. Oxford 3000 Core Vocabulary'
            className='text-lg font-bold'
          />
        </div>

        <div>
          <label className='text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase'>
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Provide context or summary for this deck...'
            rows={2}
            className='resize-none text-sm'
          />
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <label className='text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase'>
              Proficiency Level
            </label>
            <Select
              value={level}
              onValueChange={(val) => setLevel(val as CEFRLevelEnum)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select level' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CEFRLevelEnum).map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl} Level
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase'>
              Visibility
            </label>
            <Select
              value={visibility}
              onValueChange={(val) => setVisibility(val as DeckVisibilityEnum)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select visibility' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DeckVisibilityEnum.PRIVATE}>
                  Private (Only you)
                </SelectItem>
                <SelectItem value={DeckVisibilityEnum.PUBLIC}>
                  Public (Discoverable)
                </SelectItem>
                <SelectItem value={DeckVisibilityEnum.UNLISTED}>
                  Unlisted (Link only)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
