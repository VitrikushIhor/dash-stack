'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/shared/lib/actions/org-action-builder'
import { labelServerApi } from '@/entities/label/server'

const DeleteLabelInputSchema = z.object({
  id: z.string(),
})

export const deleteLabelAction = createOrgAction(
  DeleteLabelInputSchema,
  async ({ id }, { activeOrg }) => {
    await labelServerApi.delete(activeOrg.id, id)
    revalidateTag(SERVER_CACHE_TAGS.labels(activeOrg.id))
    return true
  }
)
