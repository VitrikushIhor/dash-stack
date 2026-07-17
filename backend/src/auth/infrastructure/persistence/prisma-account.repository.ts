import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  AccountRepositoryPort,
  AccountWithUserModel,
  CreateAccountData,
} from '../../application/ports/outgoing/account.repository.port';

@Injectable()
export class PrismaAccountRepository implements AccountRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<AccountWithUserModel | null> {
    return this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });
  }

  create(data: CreateAccountData): Promise<unknown> {
    return this.prisma.account.create({ data });
  }
}
