import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from backend directory
config({ path: resolve(__dirname, '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
