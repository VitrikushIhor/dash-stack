import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { PrismaEmailVerificationTransaction } from '../../../infrastructure/persistence/prisma-email-verification-transaction';

describe('PrismaEmailVerificationTransaction', () => {
  const now = new Date('2026-09-25T12:00:00.000Z');
  const sessionExpiresAt = new Date('2026-10-02T12:00:00.000Z');
  const data = {
    tokenId: 'token-1',
    tokenHash: 'token-hash',
    email: 'user@example.com',
    credentialHash: 'credential-hash',
    sessionExpiresAt,
    now,
  };

  it('should verify email and create session after conditional token consumption', async () => {
    const transaction = {
      verificationToken: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      authSession: { create: jest.fn().mockResolvedValue({ id: 'session-1' }) },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const adapter = new PrismaEmailVerificationTransaction(prisma);

    await expect(adapter.complete(data)).resolves.toEqual({
      userId: 'user-1',
      sessionId: 'session-1',
    });
    expect(transaction.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'token-1',
        token: 'token-hash',
        email: 'user@example.com',
        type: TokenType.EMAIL_VERIFICATION,
        expires: { gt: now },
      },
    });
    expect(transaction.authSession.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        credentialHash: 'credential-hash',
        expiresAt: sessionExpiresAt,
      },
      select: { id: true },
    });
  });

  it('should perform no writes when token was already consumed', async () => {
    const transaction = {
      verificationToken: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      user: { updateMany: jest.fn(), findUniqueOrThrow: jest.fn() },
      authSession: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const adapter = new PrismaEmailVerificationTransaction(prisma);

    await expect(adapter.complete(data)).resolves.toBeNull();
    expect(transaction.user.updateMany).not.toHaveBeenCalled();
    expect(transaction.authSession.create).not.toHaveBeenCalled();
  });
});
