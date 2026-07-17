import { TaskStatus } from '../../domain/enums/task-status.enum';

export interface CreateTaskCommand {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  assigneeIds?: string[];
  attachments?: string[];
  startDate?: string | Date;
  dueDate?: string | Date;
  label?: { name: string; color: string } | null;
  checklists?: Array<{
    name: string;
    items: Array<{ text: string; completed?: boolean }>;
  }>;
}
