import { z } from 'zod'
import { DeckStatusEnum } from '../../model/types'

export const GetMyDecksSchema = z
  .enum([
    DeckStatusEnum.DRAFT,
    DeckStatusEnum.PUBLISHED,
    DeckStatusEnum.ARCHIVED,
  ])
  .optional()
