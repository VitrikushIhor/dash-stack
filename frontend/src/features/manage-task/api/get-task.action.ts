'use server'

import { createAction } from '@/shared/lib'
import { taskServerApi } from '@/entities/task/server'
import { TaskByIdActionSchema } from '../model/manage-task-action.schema'

export const getTaskAction = createAction(
  TaskByIdActionSchema,
  async ({ slug, id }) => {
    return taskServerApi.findById(slug, id)
  }
)
