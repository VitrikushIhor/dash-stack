import { TaskReadModel } from '../../application/read-models/task.read-model';

interface PrismaChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  checklistId: string;
}

interface PrismaChecklist {
  id: string;
  name: string;
  taskId: string;
  items: PrismaChecklistItem[];
}

interface PrismaTaskWithRelations {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  status: string;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  assignees: Array<{
    id: string;
    user?: {
      id: string;
      firstName: string;
      email?: string | null;
      avatar?: string | null;
    } | null;
  }>;
  label: {
    id: string;
    name: string;
    color: string;
    taskId: string;
  } | null;
  checklists: PrismaChecklist[];
}

export class PrismaTaskMapper {
  static toDomain(
    prismaTask: PrismaTaskWithRelations | null,
  ): TaskReadModel | null {
    if (!prismaTask) return null;

    return {
      ...prismaTask,
      checklists: prismaTask.checklists?.map((cl) => ({
        ...cl,
        items: cl.items?.map((item) => ({
          ...item,
          text: item.title,
        })),
      })),
    } as TaskReadModel;
  }
}
