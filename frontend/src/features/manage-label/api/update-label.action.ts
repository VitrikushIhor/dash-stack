'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { UpdateLabelDtoSchema } from '@/entities/label'
import { labelServerApi } from '@/entities/label/server'
import { createOrgAction } from '@/entities/organization/server'

const UpdateLabelInputSchema = z.object({
  id: z.string(),
  dto: UpdateLabelDtoSchema,
})

export const updateLabelAction = createOrgAction(
  UpdateLabelInputSchema,
  async ({ id, dto }, { activeOrg }) => {
    const res = await labelServerApi.update(activeOrg.id, id, dto)
    revalidateTag(SERVER_CACHE_TAGS.labels(activeOrg.id))
    return res
  }
)
