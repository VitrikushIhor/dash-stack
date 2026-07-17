import { TaskStatus } from '../../domain/enums/task-status.enum';

export interface TaskAssigneeUser {
  id: string;
  firstName: string;
  email?: string | null;
  avatar?: string | null;
}

export interface TaskAssigneeRecord {
  id: string;
  user?: TaskAssigneeUser | null;
}

export interface TaskLabelRecord {
  id: string;
  name: string;
  color: string | null;
  taskId: string;
}

export interface TaskChecklistItemRecord {
  id: string;
  text: string;
  completed: boolean;
  checklistId: string;
}

export interface TaskChecklistRecord {
  id: string;
  name: string;
  taskId: string;
  items: TaskChecklistItemRecord[];
}

export interface TaskReadModel {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  assignees: TaskAssigneeRecord[];
  label: TaskLabelRecord | null;
  checklists: TaskChecklistRecord[];
}
