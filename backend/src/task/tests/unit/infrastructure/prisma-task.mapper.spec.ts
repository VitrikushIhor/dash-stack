import { PrismaTaskMapper } from '../../../infrastructure/persistence/prisma-task.mapper';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

const basePrismaTask = () => ({
  id: 'task-1',
  organizationId: 'org-1',
  title: 'Test Task',
  description: null,
  status: TaskStatus.PLANNED as string,
  startDate: null,
  dueDate: null,
  completedAt: null,
  attachments: [] as string[],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignees: [] as Array<{
    id: string;
    user?: {
      id: string;
      firstName: string;
      email?: string | null;
      avatar?: string | null;
    } | null;
  }>,
  label: null as {
    id: string;
    name: string;
    color: string;
    taskId: string;
  } | null,
  checklists: [] as Array<{
    id: string;
    name: string;
    taskId: string;
    items: Array<{
      id: string;
      title: string;
      completed: boolean;
      checklistId: string;
    }>;
  }>,
});

describe('PrismaTaskMapper', () => {
  describe('toDomain()', () => {
    it('returns null for null input', () => {
      expect(PrismaTaskMapper.toDomain(null)).toBeNull();
    });

    it('maps basic scalar fields correctly', () => {
      const raw = basePrismaTask();
      const result = PrismaTaskMapper.toDomain(raw);

      expect(result?.id).toBe('task-1');
      expect(result?.organizationId).toBe('org-1');
      expect(result?.title).toBe('Test Task');
      expect(result?.description).toBeNull();
      expect(result?.status).toBe(TaskStatus.PLANNED);
      expect(result?.startDate).toBeNull();
      expect(result?.dueDate).toBeNull();
      expect(result?.completedAt).toBeNull();
      expect(result?.attachments).toEqual([]);
    });

    it('maps assignees correctly', () => {
      const raw = {
        ...basePrismaTask(),
        assignees: [
          {
            id: 'member-1',
            user: {
              id: 'user-1',
              firstName: 'John',
              email: 'john@example.com',
              avatar: null,
            },
          },
        ],
      };

      const result = PrismaTaskMapper.toDomain(raw);
      expect(result?.assignees).toHaveLength(1);
      expect(result?.assignees[0].id).toBe('member-1');
      expect(result?.assignees[0].user?.firstName).toBe('John');
    });

    it('maps label correctly', () => {
      const raw = {
        ...basePrismaTask(),
        label: {
          id: 'label-1',
          name: 'Bug',
          color: '#ff0000',
          taskId: 'task-1',
        },
      };

      const result = PrismaTaskMapper.toDomain(raw);
      expect(result?.label?.name).toBe('Bug');
      expect(result?.label?.color).toBe('#ff0000');
    });

    it('maps null label correctly', () => {
      const raw = { ...basePrismaTask(), label: null };
      const result = PrismaTaskMapper.toDomain(raw);
      expect(result?.label).toBeNull();
    });

    it('maps checklists and renames title→text in items', () => {
      const raw = {
        ...basePrismaTask(),
        checklists: [
          {
            id: 'cl-1',
            name: 'Checklist A',
            taskId: 'task-1',
            items: [
              {
                id: 'item-1',
                title: 'Do something',
                completed: false,
                checklistId: 'cl-1',
              },
              {
                id: 'item-2',
                title: 'Do another',
                completed: true,
                checklistId: 'cl-1',
              },
            ],
          },
        ],
      };

      const result = PrismaTaskMapper.toDomain(raw);
      expect(result?.checklists).toHaveLength(1);
      expect(result?.checklists[0].name).toBe('Checklist A');
      expect(result?.checklists[0].items[0].text).toBe('Do something');
      expect(result?.checklists[0].items[1].text).toBe('Do another');
      expect(result?.checklists[0].items[1].completed).toBe(true);
    });

    it('maps multiple checklists correctly', () => {
      const raw = {
        ...basePrismaTask(),
        checklists: [
          { id: 'cl-1', name: 'CL 1', taskId: 'task-1', items: [] },
          { id: 'cl-2', name: 'CL 2', taskId: 'task-1', items: [] },
        ],
      };

      const result = PrismaTaskMapper.toDomain(raw);
      expect(result?.checklists).toHaveLength(2);
    });

    it('maps dates correctly', () => {
      const startDate = new Date('2024-01-01');
      const dueDate = new Date('2024-06-30');
      const completedAt = new Date('2024-06-15');

      const raw = { ...basePrismaTask(), startDate, dueDate, completedAt };
      const result = PrismaTaskMapper.toDomain(raw);

      expect(result?.startDate).toBe(startDate);
      expect(result?.dueDate).toBe(dueDate);
      expect(result?.completedAt).toBe(completedAt);
    });

    it('maps attachments array', () => {
      const raw = {
        ...basePrismaTask(),
        attachments: ['file-1.png', 'file-2.pdf'],
      };

      const result = PrismaTaskMapper.toDomain(raw);
      expect(result?.attachments).toEqual(['file-1.png', 'file-2.pdf']);
    });
  });
});
