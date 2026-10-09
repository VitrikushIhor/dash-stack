import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { PrismaPasswordResetTransaction } from '../../../infrastructure/persistence/prisma-password-reset-transaction';

describe('PrismaPasswordResetTransaction', () => {
  const now = new Date('2026-09-25T10:00:00.000Z');
  const data = {
    tokenId: 'token-1',
    tokenHash: 'token-hash',
    email: 'user@example.com',
    hashedPassword: 'new-hash',
    now,
  };

  it('should update password and revoke sessions after conditional token consumption', async () => {
    const transaction = {
      verificationToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        update: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      authSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<boolean>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const adapter = new PrismaPasswordResetTransaction(prisma);

    await expect(adapter.complete(data)).resolves.toBe(true);
    expect(transaction.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'token-1',
        token: 'token-hash',
        email: 'user@example.com',
        type: TokenType.PASSWORD_RESET,
        expires: { gt: now },
      },
    });
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { password: 'new-hash' },
      select: { id: true },
    });
    expect(transaction.authSession.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: now },
    });
  });

  it('should perform no writes when token was already consumed', async () => {
    const transaction = {
      verificationToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      user: { update: jest.fn() },
      authSession: { updateMany: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof transaction) => Promise<boolean>) =>
        callback(transaction),
      ),
    } as unknown as PrismaService;
    const adapter = new PrismaPasswordResetTransaction(prisma);

    await expect(adapter.complete(data)).resolves.toBe(false);
    expect(transaction.user.update).not.toHaveBeenCalled();
    expect(transaction.authSession.updateMany).not.toHaveBeenCalled();
  });
});
