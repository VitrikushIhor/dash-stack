import type { PoolConfig } from 'pg';

export function databasePoolConfig(connectionString: string | undefined): PoolConfig {
  if (!connectionString) throw new Error('Database URL is required');

  const schema = new URL(connectionString).searchParams.get('schema');
  if (schema && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new Error('Invalid database schema configuration');
  }

  return {
    connectionString,
    ...(schema ? { options: `-c search_path=${schema}` } : {}),
  };
}
