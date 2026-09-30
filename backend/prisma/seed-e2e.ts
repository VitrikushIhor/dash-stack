import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required to seed E2E users');

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const accounts = [
  {
    email: 'sessions-e2e@dashstack.app',
    firstName: 'Sessions',
    lastName: 'E2E',
  },
  {
    email: 'review-e2e@dashstack.app',
    firstName: 'Review',
    lastName: 'E2E',
  },
  {
    email: 'connected-e2e@dashstack.app',
    firstName: 'Connected',
    lastName: 'E2E',
  },
] as const;

async function seedE2EAccounts(): Promise<void> {
  const password = await hash('secret42', 10);

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        firstName: account.firstName,
        lastName: account.lastName,
        password,
        emailVerified: new Date(),
      },
      create: {
        ...account,
        password,
        emailVerified: new Date(),
      },
    });
  }
}

seedE2EAccounts()
  .catch((error: unknown) => {
    process.exitCode = 1;
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
