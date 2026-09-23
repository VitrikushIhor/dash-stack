const LOCAL_DATABASE_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

export function isLocalDatabaseUrl(connectionString: string | undefined): boolean {
  if (!connectionString) return false;

  try {
    const url = new URL(connectionString);

    return LOCAL_DATABASE_HOSTNAMES.has(url.hostname.replace(/^\[|\]$/g, '').toLowerCase());
  } catch {
    return false;
  }
}
