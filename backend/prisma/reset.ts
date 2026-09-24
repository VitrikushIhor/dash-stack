import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { isLocalDatabaseUrl } from './reset-safety';

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
  const isLocalDb = isLocalDatabaseUrl(connectionString);

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
  await prisma.$transaction(async (tx) => {
    await tx.deckLeaderboard.deleteMany();
    await tx.vocabProgress.deleteMany();
    await tx.matchSessionAttempt.deleteMany();
    await tx.matchSessionCard.deleteMany();
    await tx.matchSession.deleteMany();
    await tx.deckEditorReceipt.deleteMany();
    await tx.flashcard.deleteMany();
    await tx.deck.deleteMany();
    await tx.organizationLabel.deleteMany();
    await tx.checklistItem.deleteMany();
    await tx.checklist.deleteMany();
    await tx.task.deleteMany();
    await tx.membership.deleteMany();
    await tx.organization.deleteMany();
    await tx.verificationToken.deleteMany();
    await tx.user.deleteMany();
  });

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
