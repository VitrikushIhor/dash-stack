export const CEFRLevelEnum = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
} as const
export type CEFRLevelEnum = (typeof CEFRLevelEnum)[keyof typeof CEFRLevelEnum]

export const DeckStatusEnum = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const
export type DeckStatusEnum =
  (typeof DeckStatusEnum)[keyof typeof DeckStatusEnum]

export const DeckVisibilityEnum = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
  UNLISTED: 'UNLISTED',
} as const
export type DeckVisibilityEnum =
  (typeof DeckVisibilityEnum)[keyof typeof DeckVisibilityEnum]

export const DeckTypeEnum = {
  SYSTEM: 'SYSTEM',
  USER_GENERATED: 'USER_GENERATED',
} as const
export type DeckTypeEnum = (typeof DeckTypeEnum)[keyof typeof DeckTypeEnum]

export type Flashcard = {
  id: string
  deckId: string
  term: string
  definition: string
  example?: string | null
  imageUrl?: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export type Deck = {
  id: string
  ownerUserId: string
  title: string
  slug?: string | null
  description?: string | null
  language: string
  level?: CEFRLevelEnum | null
  tags: string[]
  visibility: DeckVisibilityEnum
  status: DeckStatusEnum
  type: DeckTypeEnum
  forkedFromDeckId?: string | null
  cardCount?: number
  forkCount?: number
  creator?: { displayName: string | null; avatarUrl: string | null }
  flashcards?: Flashcard[]
  createdAt: string
  updatedAt: string
}

export type DeckEditorSaveResponse = Deck & {
  flashcards: Flashcard[]
}

export type CreateDeckDto = {
  title: string
  description?: string
  language?: string
  level?: CEFRLevelEnum
  tags?: string[]
  visibility?: DeckVisibilityEnum
}

export type UpdateDeckDto = {
  title?: string
  description?: string
  language?: string
  level?: CEFRLevelEnum | null
  tags?: string[]
  visibility?: DeckVisibilityEnum
}

export type SaveDeckEditorDto = {
  operationId: string
  expectedUpdatedAt: string
  metadata: UpdateDeckDto
  cards: Array<{
    id?: string
    term: string
    definition: string
    example?: string | null
    imageUrl?: string | null
  }>
  deletedCardIds: string[]
}

export type CreateFlashcardDto = {
  term: string
  definition: string
  example?: string
  imageUrl?: string
  position?: number
}

export type UpdateFlashcardDto = {
  term?: string
  definition?: string
  example?: string | null
  imageUrl?: string | null
  position?: number
}

export type UnsplashImage = {
  id: string
  thumbUrl: string
  regularUrl: string
  altDescription: string | null
  photographerName: string
  photographerUrl: string
}

export type UnsplashSearchResult = {
  results: UnsplashImage[]
  total: number
  totalPages: number
}
