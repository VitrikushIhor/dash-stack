import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { PrismaLabelRepository } from '../../../label/infrastructure/persistence/prisma-label.repository';
import { TaskLabelValidatorService } from '../../application/services/task-label-validator.service';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { InvalidTaskLabelException } from '../../domain/exceptions/invalid-task-label.exception';
import { PrismaTaskRepository } from '../../infrastructure/persistence/prisma-task.repository';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for task integration tests');

describe('Task label PostgreSQL race', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let tasks: PrismaTaskRepository;
  let labels: TaskLabelValidatorService;
  let userId: string;
  let orgId: string;
  let labelId: string;

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    tasks = new PrismaTaskRepository(prisma);
    labels = new TaskLabelValidatorService(new PrismaLabelRepository(prisma));
  });

  beforeEach(async () => {
    const suffix = randomUUID();
    const user = await prisma.user.create({
      data: { email: `task-label-race-${suffix}@example.test` },
    });
    const organization = await prisma.organization.create({
      data: { name: 'Task label race', slug: `task-label-race-${suffix}` },
    });
    const label = await prisma.organizationLabel.create({
      data: { organizationId: organization.id, name: 'Concurrent', color: '#000000' },
    });
    userId = user.id;
    orgId = organization.id;
    labelId = label.id;
  });

  afterEach(async () => {
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should_accept_label_from_same_organization', async () => {
    const task = await tasks.create({
      actorUserId: userId,
      organizationId: orgId,
      title: 'Own label',
      status: TaskStatus.PLANNED,
      labelId,
    });

    expect(task.label?.id).toBe(labelId);
    expect(await prisma.task.count({ where: { organizationId: orgId, labelId } })).toBe(1);
  });

  it('should_reject_foreign_organization_label_inside_task_transaction', async () => {
    const foreignOrganization = await prisma.organization.create({
      data: { name: 'Foreign labels', slug: `foreign-label-${randomUUID()}` },
    });
    try {
      const foreignLabel = await prisma.organizationLabel.create({
        data: { organizationId: foreignOrganization.id, name: 'Foreign', color: '#ffffff' },
      });

      await expect(
        tasks.create({
          actorUserId: userId,
          organizationId: orgId,
          title: 'Foreign label',
          status: TaskStatus.PLANNED,
          labelId: foreignLabel.id,
        }),
      ).rejects.toThrow(InvalidTaskLabelException);
      expect(await prisma.task.count({ where: { organizationId: orgId } })).toBe(0);
    } finally {
      await prisma.organization.delete({ where: { id: foreignOrganization.id } });
    }
  });

  it('should_reject_create_with_domain_error_when_label_is_deleted_after_validation', async () => {
    await labels.validateOrThrow(orgId, labelId);
    await prisma.organizationLabel.delete({ where: { id: labelId } });

    await expect(
      tasks.create({
        actorUserId: userId,
        organizationId: orgId,
        title: 'Racing create',
        status: TaskStatus.PLANNED,
        labelId,
      }),
    ).rejects.toThrow(InvalidTaskLabelException);
    expect(await prisma.task.count({ where: { organizationId: orgId } })).toBe(0);
  });

  it('should_preserve_task_when_label_is_deleted_before_update_transaction', async () => {
    const task = await prisma.task.create({
      data: { title: 'Before', organizationId: orgId },
    });
    await labels.validateOrThrow(orgId, labelId);
    await prisma.organizationLabel.delete({ where: { id: labelId } });

    await expect(
      tasks.update(task.id, orgId, {
        actorUserId: userId,
        title: 'After',
        labelId,
      }),
    ).rejects.toThrow(InvalidTaskLabelException);
    expect(await prisma.task.findUnique({ where: { id: task.id } })).toMatchObject({
      title: 'Before',
      labelId: null,
    });
  });
});
