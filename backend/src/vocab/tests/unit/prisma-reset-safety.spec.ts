import { isLocalDatabaseUrl } from '../../../../prisma/reset-safety';

describe('isLocalDatabaseUrl', () => {
  it.each([
    'postgresql://user:password@localhost:5432/app',
    'postgresql://user:password@127.0.0.1:5432/app',
    'postgresql://user:password@[::1]:5432/app',
    'postgresql://user:password@postgres:5432/app',
  ])('accepts an exact local database hostname: %s', (connectionString) => {
    expect(isLocalDatabaseUrl(connectionString)).toBe(true);
  });

  it.each([
    undefined,
    'not a database url',
    'postgresql://localhost:password@production.example.com:5432/app',
    'postgresql://user:password@production.example.com:5432/localhost',
    'postgresql://user:password@localhost.production.example.com:5432/app',
  ])('rejects a non-local database URL: %s', (connectionString) => {
    expect(isLocalDatabaseUrl(connectionString)).toBe(false);
  });
});
