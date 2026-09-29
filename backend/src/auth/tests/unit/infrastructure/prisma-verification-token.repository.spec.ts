import { TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { PrismaVerificationTokenRepository } from '../../../infrastructure/persistence/prisma-verification-token.repository';

describe('PrismaVerificationTokenRepository.issueLatest', () => {
  const data = {
    email: 'user@example.com',
    token: 'hashed-token',
    type: AuthTokenType.PASSWORD_RESET,
    expires: new Date('2026-10-01T00:00:00.000Z'),
  };
  const saved = { ...data, id: 'token-1', type: TokenType.PASSWORD_RESET };

  it('should delete and create inside one serializable transaction', async () => {
    const tx = {
      $executeRaw: jest.fn().mockResolvedValue([]),
      verificationToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue(saved),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) =>
        callback(tx),
      ),
    } as unknown as PrismaService;

    const result = await new PrismaVerificationTokenRepository(prisma).issueLatest(data);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(tx.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { email: data.email, type: TokenType.PASSWORD_RESET },
    });
    expect(tx.verificationToken.create).toHaveBeenCalledWith({
      data: { ...data, type: TokenType.PASSWORD_RESET },
    });
    expect(result).toEqual(saved);
  });

  it('should surface a failed transaction without returning a token', async () => {
    const failure = new Error('create failed');
    const prisma = {
      $transaction: jest.fn().mockRejectedValue(failure),
    } as unknown as PrismaService;

    await expect(new PrismaVerificationTokenRepository(prisma).issueLatest(data)).rejects.toBe(
      failure,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
