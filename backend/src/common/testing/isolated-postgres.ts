import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';

export interface IsolatedPostgres {
  prisma: PrismaService;
  close(): Promise<void>;
}

export async function createIsolatedPostgres(databaseUrl: string): Promise<IsolatedPostgres> {
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  const pool = new Pool({ connectionString: databaseUrl, options: `-c search_path=${schema}` });
  const prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool, { schema }) } });
  const migrationDirectory = resolve(__dirname, '../../../prisma/migrations');

  try {
    await pool.query(`CREATE SCHEMA "${schema}"`);
    const migrations = await readdir(migrationDirectory, { withFileTypes: true });
    for (const migration of migrations
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const sql = await readFile(
        resolve(migrationDirectory, migration.name, 'migration.sql'),
        'utf8',
      );
      // Historical migrations qualify public; all test DDL must stay in this generated schema.
      await pool.query(sql.replaceAll('"public".', `"${schema}".`));
    }
  } catch (error: unknown) {
    try {
      await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
    throw error;
  }

  return {
    prisma,
    async close(): Promise<void> {
      try {
        await prisma.$disconnect();
        await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
      } finally {
        await pool.end();
      }
    },
  };
}
