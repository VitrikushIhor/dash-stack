import { cache } from 'react'
import { z } from 'zod'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { DeckStatusEnum } from '../../model/types'
import { deckServerApi } from '../../server/deck-api.server'

const GetMyDecksSchema = z
  .enum([
    DeckStatusEnum.DRAFT,
    DeckStatusEnum.PUBLISHED,
    DeckStatusEnum.ARCHIVED,
  ])
  .optional()

export const getMyDecksQuery = cache(
  createServerQuery('getMyDecksQuery', GetMyDecksSchema, (status) =>
    deckServerApi.getMyDecks(status)
  )
)
