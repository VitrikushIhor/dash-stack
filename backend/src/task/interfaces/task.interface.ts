import { TaskStatus } from '../enums/task-status.enum';

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  attachments?: string[];
  organizationId: string;
  assigneeIds?: string[];
  label: { name: string; color: string };
  checklists?: Array<{
    name: string;
    items: Array<{ title: string; completed?: boolean }>;
  }>;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  attachments?: string[];
  assigneeIds?: string[];
  label?: { name: string; color: string } | null;
  checklists?: Array<{
    name: string;
    items: Array<{ title: string; completed?: boolean }>;
  }>;
}
