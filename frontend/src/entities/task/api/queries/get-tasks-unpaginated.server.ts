import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { TaskQueryInputSchema } from '../../model/task-query.schema'
import { type TaskFilters } from '../task-api'
import { taskServerApi } from '../task-api.server'

const getTasksUnpaginatedQuery = createServerQuery(
  'getTasksUnpaginated',
  TaskQueryInputSchema,
  ({ slug, filters }) => taskServerApi.findAllUnpaginated(slug, filters)
)

export const getTasksUnpaginated = async (
  slug: string,
  filters?: Omit<TaskFilters, 'page' | 'perPage'>
) => getTasksUnpaginatedQuery({ slug, filters })
