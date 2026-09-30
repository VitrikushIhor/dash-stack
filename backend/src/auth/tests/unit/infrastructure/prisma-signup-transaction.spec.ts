import { Prisma, TokenType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { AuthTokenType } from '../../../domain/enums/token-type.enum';
import { PrismaSignupTransaction } from '../../../infrastructure/persistence/prisma-signup-transaction';

describe('PrismaSignupTransaction', () => {
  const user = { email: 'new@example.test', password: 'hashed-password' };
  const token = {
    email: user.email,
    token: 'hashed-token',
    type: AuthTokenType.EMAIL_VERIFICATION,
    expires: new Date('2026-10-01T00:00:00.000Z'),
  };

  it('should_create_user_and_verification_token_in_one_transaction', async () => {
    const tx = {
      user: { create: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      verificationToken: { create: jest.fn().mockResolvedValue({ id: 'token-1' }) },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<void>) => callback(tx)),
    } as unknown as PrismaService;

    await expect(new PrismaSignupTransaction(prisma).createPending(user, token)).resolves.toBe(
      true,
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.user.create).toHaveBeenCalledWith({ data: user });
    expect(tx.verificationToken.create).toHaveBeenCalledWith({
      data: { ...token, type: TokenType.EMAIL_VERIFICATION },
    });
  });

  it('should_return_false_only_for_email_unique_constraint_conflict', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: {
        modelName: 'User',
        driverAdapterError: { cause: { constraint: { fields: ['email'] } } },
      },
    });
    const prisma = {
      $transaction: jest.fn().mockRejectedValue(conflict),
    } as unknown as PrismaService;

    await expect(new PrismaSignupTransaction(prisma).createPending(user, token)).resolves.toBe(
      false,
    );
  });

  it.each([
    { modelName: 'Account', driverAdapterError: { cause: { constraint: { fields: ['email'] } } } },
    { modelName: 'User', driverAdapterError: { cause: { constraint: { fields: ['id'] } } } },
    { modelName: 'User', driverAdapterError: { cause: null } },
  ])('should_surface_other_unique_constraint_conflicts_%j', async (meta) => {
    const conflict = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta,
    });
    const prisma = {
      $transaction: jest.fn().mockRejectedValue(conflict),
    } as unknown as PrismaService;

    await expect(new PrismaSignupTransaction(prisma).createPending(user, token)).rejects.toBe(
      conflict,
    );
  });

  it('should_surface_unexpected_transaction_failure', async () => {
    const failure = new Error('Database unavailable');
    const prisma = {
      $transaction: jest.fn().mockRejectedValue(failure),
    } as unknown as PrismaService;

    await expect(new PrismaSignupTransaction(prisma).createPending(user, token)).rejects.toBe(
      failure,
    );
  });
});
