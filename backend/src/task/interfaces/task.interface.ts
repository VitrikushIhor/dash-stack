import { TaskStatus } from '../enums/task-status.enum';

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  deadline?: Date;
  attachments?: string[];
  organizationId: string;
  assigneeIds?: string[];
  labels?: Array<{ name: string; color: string }>;
  checklists?: Array<{
    name: string;
    items: Array<{ title: string; completed?: boolean }>;
  }>;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  deadline?: Date;
  attachments?: string[];
  assigneeIds?: string[];
  labels?: Array<{ name: string; color: string }>;
  checklists?: Array<{
    name: string;
    items: Array<{ title: string; completed?: boolean }>;
  }>;
}
