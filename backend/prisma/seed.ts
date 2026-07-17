import { PrismaClient, TaskStatus, OrgRole } from '@prisma/client';
import { addDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.taskLabel.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.task.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding...');

  // 1. Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'ihor@example.com',
      firstName: 'Ihor',
      lastName: 'Vitrikush',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bart@simpson.com',
      firstName: 'Bart',
      lastName: 'Simpson',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
    },
  });

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Dash Stack Team',
      slug: 'dash-stack',
      description: 'The ultimate dashboard project',
    },
  });

  // 3. Create Memberships
  const membership1 = await prisma.membership.create({
    data: {
      userId: user1.id,
      orgId: org.id,
      role: OrgRole.OWNER,
    },
  });

  const membership2 = await prisma.membership.create({
    data: {
      userId: user2.id,
      orgId: org.id,
      role: OrgRole.MEMBER,
    },
  });

  // 4. Create Tasks with due dates for the calendar
  const today = startOfDay(new Date());

  await prisma.task.create({
    data: {
      title: 'Fix Calendar Data Connection',
      description: 'Connect frontend to real data using useTasksQuery',
      status: TaskStatus.COMPLETED,
      dueDate: today,
      completedAt: today,
      organizationId: org.id,
      assignees: {
        connect: [{ id: membership1.id }],
      },
      label: {
        create: { name: 'Feature', color: 'blue' },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Database Migration',
      description: 'Sync Prisma schema with PostgreSQL',
      status: TaskStatus.COMPLETED,
      dueDate: addDays(today, 1),
      completedAt: addDays(today, 1),
      organizationId: org.id,
      assignees: {
        connect: [{ id: membership1.id }],
      },
      label: {
        create: { name: 'DevOps', color: 'purple' },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'UI Design Review',
      description: 'Review the new dashboard layout with the team',
      status: TaskStatus.UPCOMING,
      dueDate: addDays(today, 2),
      organizationId: org.id,
      assignees: {
        connect: [{ id: membership2.id }],
      },
      label: {
        create: { name: 'Design', color: 'pink' },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Release Beta Version',
      description: 'Deploy the first beta to staging environment',
      status: TaskStatus.PLANNED,
      dueDate: addDays(today, 5),
      organizationId: org.id,
      assignees: {
        connect: [{ id: membership1.id }, { id: membership2.id }],
      },
      label: {
        create: { name: 'Release', color: 'green' },
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
