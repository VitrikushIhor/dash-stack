import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
