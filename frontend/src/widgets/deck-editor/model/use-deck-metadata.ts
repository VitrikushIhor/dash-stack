import React from 'react'
import {
  CEFRLevelEnum,
  type Deck,
  type DeckVisibilityEnum,
} from '@/entities/deck'

export function useDeckMetadata(initialDeck: Deck) {
  const [title, setTitle] = React.useState(initialDeck.title)
  const [description, setDescription] = React.useState(
    initialDeck.description || ''
  )
  const [level, setLevel] = React.useState<CEFRLevelEnum>(
    initialDeck.level || CEFRLevelEnum.B1
  )
  const [visibility, setVisibility] = React.useState<DeckVisibilityEnum>(
    initialDeck.visibility
  )
  const [language, setLanguage] = React.useState(initialDeck.language)
  const [tags, setTags] = React.useState(initialDeck.tags)

  return {
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
  }
}
