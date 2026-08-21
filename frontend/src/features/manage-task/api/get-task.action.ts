'use server'

import { z } from 'zod'
import { createAction } from '@/shared/lib'
import { OrganizationSlugSchema } from '@/entities/organization'
import { TaskIdSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const getTaskAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    id: TaskIdSchema,
  }),
  async ({ slug, id }) => {
    return taskServerApi.findById(slug, id)
  }
)
