import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import {
  ConflictException,
  UnauthorizedException,
} from '../../../../common/exceptions/domain.exception';
import { PrismaLinkedAccountsRepository } from '../../../infrastructure/persistence/prisma-linked-accounts.repository';

describe('PrismaLinkedAccountsRepository', () => {
  const userId = 'user-1';
  const provider = 'google';
  const providerAccountId = 'google-123';

  it('should_return_distinct_linked_providers_for_the_user', async () => {
    const findMany = jest.fn().mockResolvedValue([{ provider: 'google' }, { provider: 'github' }]);
    const prisma = { account: { findMany } } as unknown as PrismaService;

    await expect(new PrismaLinkedAccountsRepository(prisma).list(userId)).resolves.toEqual([
      'google',
      'github',
    ]);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId },
      select: { provider: true },
      distinct: ['provider'],
    });
  });

  function transactionWith(identity: { userId: string } | null, existingProvider = false) {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: userId }]),
      account: {
        findUnique: jest.fn().mockResolvedValue(identity),
        findFirst: jest.fn().mockResolvedValue(existingProvider ? { id: 'existing' } : null),
        create: jest.fn().mockResolvedValue({ id: 'linked' }),
      },
    };
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<void>) => callback(tx)),
    } as unknown as PrismaService;
    return { tx, repository: new PrismaLinkedAccountsRepository(prisma) };
  }

  it('should_create_link_only_when_user_and_provider_are_available', async () => {
    const { tx, repository } = transactionWith(null);

    await repository.link(userId, provider, providerAccountId);

    expect(tx.account.findUnique).toHaveBeenCalledWith({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });
    expect(tx.account.create).toHaveBeenCalledWith({
      data: { userId, provider, providerAccountId },
    });
  });

  it('should_treat_relinking_the_same_identity_as_idempotent', async () => {
    const { tx, repository } = transactionWith({ userId });

    await expect(repository.link(userId, provider, providerAccountId)).resolves.toBeUndefined();

    expect(tx.account.create).not.toHaveBeenCalled();
  });

  it('should_reject_identity_owned_by_another_user', async () => {
    const { tx, repository } = transactionWith({ userId: 'other-user' });

    await expect(repository.link(userId, provider, providerAccountId)).rejects.toThrow(
      ConflictException,
    );
    expect(tx.account.create).not.toHaveBeenCalled();
  });

  it('should_reject_second_identity_for_the_same_provider', async () => {
    const { tx, repository } = transactionWith(null, true);

    await expect(repository.link(userId, provider, providerAccountId)).rejects.toThrow(
      ConflictException,
    );
    expect(tx.account.create).not.toHaveBeenCalled();
  });

  it('should_reject_link_when_user_no_longer_exists', async () => {
    const { tx, repository } = transactionWith(null);
    tx.$queryRaw.mockResolvedValue([]);

    await expect(repository.link(userId, provider, providerAccountId)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(tx.account.create).not.toHaveBeenCalled();
  });

  it('should_translate_unique_constraint_race_to_link_conflict', async () => {
    const { tx, repository } = transactionWith(null);
    tx.account.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(repository.link(userId, provider, providerAccountId)).rejects.toThrow(
      ConflictException,
    );
  });
});
