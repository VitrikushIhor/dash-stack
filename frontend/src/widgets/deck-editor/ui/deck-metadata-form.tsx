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
import {
  CEFRLevelEnum,
  DeckVisibilityEnum,
  normalizeDeckTag,
} from '@/entities/deck'
import { type useDeckMetadata } from '../model/use-deck-metadata'

interface DeckMetadataFormProps {
  state: ReturnType<typeof useDeckMetadata>
}

export function DeckMetadataForm({ state }: DeckMetadataFormProps) {
  const [tagInput, setTagInput] = React.useState('')
  const {
    title,
    setTitle,
    description,
    setDescription,
    level,
    setLevel,
    visibility,
    setVisibility,
    language,
    setLanguage,
    tags,
    setTags,
  } = state

  const addTag = (value: string) => {
    const tag = normalizeDeckTag(value)

    if (tag && !tags.includes(tag)) setTags([...tags, tag])
    setTagInput('')
  }

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(tagInput)
    }
  }

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

          <div>
            <label
              htmlFor='deck-language'
              className='text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase'
            >
              Language
            </label>
            <Input
              id='deck-language'
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder='e.g. en'
              autoCapitalize='none'
              spellCheck={false}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor='deck-tags'
            className='text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase'
          >
            Tags
          </label>
          <Input
            id='deck-tags'
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder='Type a tag and press Enter'
          />
          <p className='text-muted-foreground mt-1.5 text-xs'>
            Press Enter or comma to add a tag.
          </p>
          {tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium'
                >
                  #{tag}
                  <button
                    type='button'
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => setTags(tags.filter((item) => item !== tag))}
                    className='text-muted-foreground hover:text-foreground ml-1'
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
