import { PrismaClient, TaskStatus, OrgRole } from '@prisma/client';
import { addDays, startOfDay } from 'date-fns';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up database...');
  await prisma.organizationLabel.deleteMany();
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
      emailVerified: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bart@simpson.com',
      firstName: 'Bart',
      lastName: 'Simpson',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
      emailVerified: new Date(),
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
      organization: { connect: { id: org.id } },
      assignees: {
        connect: [{ id: membership1.id }],
      },
      label: {
        create: {
          name: 'Feature',
          color: 'blue',
          organization: { connect: { id: org.id } },
        },
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
      organization: { connect: { id: org.id } },
      assignees: {
        connect: [{ id: membership1.id }],
      },
      label: {
        create: {
          name: 'DevOps',
          color: 'purple',
          organization: { connect: { id: org.id } },
        },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'UI Design Review',
      description: 'Review the new dashboard layout with the team',
      status: TaskStatus.UPCOMING,
      dueDate: addDays(today, 2),
      organization: { connect: { id: org.id } },
      assignees: {
        connect: [{ id: membership2.id }],
      },
      label: {
        create: {
          name: 'Design',
          color: 'pink',
          organization: { connect: { id: org.id } },
        },
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Release Beta Version',
      description: 'Deploy the first beta to staging environment',
      status: TaskStatus.PLANNED,
      dueDate: addDays(today, 5),
      organization: { connect: { id: org.id } },
      assignees: {
        connect: [{ id: membership1.id }, { id: membership2.id }],
      },
      label: {
        create: {
          name: 'Release',
          color: 'green',
          organization: { connect: { id: org.id } },
        },
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
    await pool.end();
  });
