import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { DueReviewsQuerySchema } from '../../model/vocab.schema'
import { vocabServerApi } from '../vocab-api.server'

export const getDueReviewsQuery = cache(
  createServerQuery('getDueReviewsQuery', DueReviewsQuerySchema, (params) =>
    vocabServerApi.getDueReviews(params?.deckId)
  )
)
