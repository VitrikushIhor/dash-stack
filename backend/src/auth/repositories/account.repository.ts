import { Injectable } from '@nestjs/common';
import { Account, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

export interface CreateAccountData {
  userId: string;
  provider: string;
  providerAccountId: string;
}

export type AccountWithUser = Account & { user: User };

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<AccountWithUser | null> {
    return this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });
  }

  create(data: CreateAccountData): Promise<Account> {
    return this.prisma.account.create({ data });
  }
}
