import 'dotenv/config';
import { PrismaClient, TaskStatus, OrgRole } from '@prisma/client';
import { addDays, startOfDay } from 'date-fns';
import { systemDecks } from './seeds/vocabulary-data';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting idempotent seed...');

  // 1. Upsert Users
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@dashstack.app' },
    update: {},
    create: {
      email: 'admin@dashstack.app',
      firstName: 'Admin',
      lastName: 'User',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
      emailVerified: new Date(),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bart@simpson.com' },
    update: {},
    create: {
      email: 'bart@simpson.com',
      firstName: 'Bart',
      lastName: 'Simpson',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
      emailVerified: new Date(),
    },
  });

  // 2. Upsert Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'dash-stack' },
    update: {},
    create: {
      name: 'Dash Stack Team',
      slug: 'dash-stack',
      description: 'The ultimate dashboard project',
    },
  });

  // 3. Upsert Memberships
  const membership1 = await prisma.membership.upsert({
    where: { userId_orgId: { userId: user1.id, orgId: org.id } },
    update: { role: OrgRole.OWNER },
    create: {
      userId: user1.id,
      orgId: org.id,
      role: OrgRole.OWNER,
    },
  });

  const membership2 = await prisma.membership.upsert({
    where: { userId_orgId: { userId: user2.id, orgId: org.id } },
    update: { role: OrgRole.MEMBER },
    create: {
      userId: user2.id,
      orgId: org.id,
      role: OrgRole.MEMBER,
    },
  });

  // 4. Create Tasks only if none exist for the org
  const taskCount = await prisma.task.count({ where: { organizationId: org.id } });
  if (taskCount === 0) {
    console.log('Seeding demo tasks...');
    const today = startOfDay(new Date());

    await prisma.task.create({
      data: {
        title: 'Fix Calendar Data Connection',
        description: 'Connect frontend to real data using useTasksQuery',
        status: TaskStatus.COMPLETED,
        dueDate: today,
        completedAt: today,
        organization: { connect: { id: org.id } },
        assignees: { connect: [{ id: membership1.id }] },
        label: {
          create: { name: 'Feature', color: 'blue', organization: { connect: { id: org.id } } },
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
        assignees: { connect: [{ id: membership1.id }] },
        label: {
          create: { name: 'DevOps', color: 'purple', organization: { connect: { id: org.id } } },
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
        assignees: { connect: [{ id: membership2.id }] },
        label: {
          create: { name: 'Design', color: 'pink', organization: { connect: { id: org.id } } },
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
        assignees: { connect: [{ id: membership1.id }, { id: membership2.id }] },
        label: {
          create: { name: 'Release', color: 'green', organization: { connect: { id: org.id } } },
        },
      },
    });
  } else {
    console.log(`Organization already has ${taskCount} tasks, skipping demo tasks...`);
  }

  // 5. Seed Vocabulary System Decks
  console.log('Seeding vocabulary starter decks...');
  for (const deckData of systemDecks) {
    const deck = await prisma.deck.upsert({
      where: { slug: deckData.slug },
      update: {
        title: deckData.title,
        description: deckData.description,
        language: deckData.language,
        level: deckData.level,
        tags: deckData.tags,
        visibility: deckData.visibility,
        status: deckData.status,
        type: deckData.type,
      },
      create: {
        ownerUserId: user1.id,
        title: deckData.title,
        slug: deckData.slug,
        description: deckData.description,
        language: deckData.language,
        level: deckData.level,
        tags: deckData.tags,
        visibility: deckData.visibility,
        status: deckData.status,
        type: deckData.type,
        flashcards: {
          create: deckData.flashcards.map((card, index) => ({
            term: card.term,
            definition: card.definition,
            example: card.example,
            imageUrl: card.imageUrl,
            position: index + 1,
          })),
        },
      },
    });

    console.log(
      `- Seeded deck: "${deck.title}" (${deck.slug}) with ${deckData.flashcards.length} cards`,
    );
  }

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
