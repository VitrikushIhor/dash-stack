export const TASK_ERRORS = {
  NOT_FOUND: (id: string) => `Task with ID ${id} not found`,
  INVALID_ASSIGNEES: 'One or more assigneeIds do not belong to this organization',
  INVALID_LABEL: 'labelId does not belong to this organization',
  INVALID_ATTACHMENTS: 'One or more attachments are not owned by this user or are already attached',
  BULK_STATUS_REQUIRED: 'status is required for bulk update',
  INVALID_DATE_RANGE: 'startDate cannot be greater than dueDate',
  INVALID_DATE_FORMAT: (value: string) => `Invalid date string: ${value}`,
} as const;
