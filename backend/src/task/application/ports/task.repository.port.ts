import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskReadModel } from '../read-models/task.read-model';

export interface ChecklistItemInput {
  text: string;
  completed?: boolean;
}

export interface ChecklistInput {
  name: string;
  items: ChecklistItemInput[];
}

export interface LabelInput {
  name: string;
  color?: string | null;
}

export interface CreateTaskData {
  organizationId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigneeIds?: string[];
  attachments?: string[];
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  label?: LabelInput | null;
  checklists?: ChecklistInput[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assigneeIds?: string[];
  attachments?: string[];
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  label?: LabelInput | null;
  checklists?: ChecklistInput[];
}

export interface FindAllTasksFilters {
  search?: string;
  status?: TaskStatus[];
  assigneeIds?: string[];
  labelNames?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  startDateFrom?: Date;
  startDateTo?: Date;
}

export interface TaskRepositoryPort {
  create(data: CreateTaskData): Promise<TaskReadModel>;
  findAll(
    organizationId: string,
    filters: FindAllTasksFilters,
  ): Promise<TaskReadModel[]>;
  findById(id: string, organizationId: string): Promise<TaskReadModel | null>;
  update(
    id: string,
    organizationId: string,
    data: UpdateTaskData,
  ): Promise<TaskReadModel>;
  delete(id: string, organizationId: string): Promise<void>;
  deleteMany(organizationId: string, ids: string[]): Promise<{ count: number }>;
  updateMany(
    organizationId: string,
    ids: string[],
    data: Partial<Omit<UpdateTaskData, 'assigneeIds' | 'label' | 'checklists'>>,
    additionalWhere?: Record<string, unknown>,
  ): Promise<{ count: number }>;
}
