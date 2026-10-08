import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { TaskQueryInputSchema } from '../../model/task-query.schema'
import { type TaskFilters } from '../task-api'
import { taskServerApi } from '../task-api.server'

const getOrganizationTasksQuery = createServerQuery(
  'getOrganizationTasks',
  TaskQueryInputSchema,
  ({ slug, filters }) => taskServerApi.findAll(slug, filters)
)

export const getOrganizationTasks = async (
  slug: string,
  filters?: TaskFilters
) => getOrganizationTasksQuery({ slug, filters })
