import { Prisma } from '@prisma/client';

const prismaConflictCodes = new Set(['P2034', 'P2002']);
const postgresRetryableCodes = new Set(['40001', '40P01']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readProperty(value: unknown, property: string): unknown {
  return isRecord(value) ? value[property] : undefined;
}

function hasRetryablePostgresCode(value: unknown, property: string): boolean {
  const code = readProperty(value, property);
  return typeof code === 'string' && postgresRetryableCodes.has(code);
}

export function isPrismaWriteConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (prismaConflictCodes.has(error.code)) return true;
  if (error.code !== 'P2010') return false;

  if (hasRetryablePostgresCode(error.meta, 'code')) return true;

  const adapterCause = readProperty(readProperty(error.meta, 'driverAdapterError'), 'cause');
  return hasRetryablePostgresCode(adapterCause, 'originalCode');
}
