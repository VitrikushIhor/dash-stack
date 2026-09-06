import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const env = process.env.NODE_ENV || 'development';
  if (['production', 'staging', 'preview'].includes(env)) {
    console.error(`FATAL: Running destructive reset in ${env} environment is strictly forbidden!`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const isLocalDb =
    connectionString &&
    (connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1') ||
      connectionString.includes('postgres:5432'));

  if (!isLocalDb && !args.includes('--force-remote')) {
    console.error('ERROR: DATABASE_URL does not appear to be a local database.');
    console.error(
      'If you REALLY want to wipe this remote database, pass --force-remote in addition to --confirm.',
    );
    process.exit(1);
  }

  if (!args.includes('--confirm')) {
    console.error('ERROR: You must pass the --confirm flag to execute the database reset.');
    console.error('Example: pnpm run db:reset -- --confirm');
    process.exit(1);
  }

  console.log('Cleaning up database...');
  await prisma.deckLeaderboard.deleteMany();
  await prisma.vocabProgress.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.organizationLabel.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.task.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned successfully!');
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
