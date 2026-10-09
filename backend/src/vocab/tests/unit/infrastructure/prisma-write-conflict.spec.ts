import { Prisma } from '@prisma/client';
import { isPrismaWriteConflict } from '../../../infrastructure/persistence/prisma-write-conflict';

function knownRequestError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('Write conflict', {
    code,
    clientVersion: Prisma.prismaVersion.client,
    meta,
  });
}

describe('isPrismaWriteConflict', () => {
  it.each(['P2034', 'P2002'])('recognizes Prisma write conflict %s', (code) => {
    expect(isPrismaWriteConflict(knownRequestError(code))).toBe(true);
  });

  it.each(['40001', '40P01'])('recognizes PostgreSQL retryable error %s', (code) => {
    expect(isPrismaWriteConflict(knownRequestError('P2010', { code }))).toBe(true);
  });

  it('recognizes PostgreSQL adapter error causes', () => {
    expect(
      isPrismaWriteConflict(
        knownRequestError('P2010', {
          driverAdapterError: { cause: { originalCode: '40001' } },
        }),
      ),
    ).toBe(true);
  });

  it('rejects non-retryable errors', () => {
    expect(isPrismaWriteConflict(knownRequestError('P2010', { code: '23505' }))).toBe(false);
    expect(isPrismaWriteConflict(new Error('Network failure'))).toBe(false);
  });
});
