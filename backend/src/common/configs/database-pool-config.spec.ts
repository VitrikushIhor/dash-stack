import { databasePoolConfig } from './database-pool-config';

describe('PostgreSQL pool configuration', () => {
  it('should_set_search_path_for_a_valid_schema', () => {
    expect(databasePoolConfig('postgresql://app:secret@localhost/app?schema=tenant_1')).toEqual({
      connectionString: 'postgresql://app:secret@localhost/app?schema=tenant_1',
      options: '-c search_path=tenant_1',
    });
  });

  it.each(['public%20-c%20log_statement=all', 'tenant;drop', 'tenant\\other'])(
    'should_reject_invalid_search_path_%s',
    (schema) => {
      expect(() =>
        databasePoolConfig(`postgresql://app:secret@localhost/app?schema=${schema}`),
      ).toThrow('Invalid database schema configuration');
    },
  );

  it('should_reject_missing_url_without_logging_it', () => {
    expect(() => databasePoolConfig(undefined)).toThrow('Database URL is required');
  });
});
