import { Inject, Injectable } from '@nestjs/common';
import { LinkedAccountsPort } from '../../ports/outgoing/linked-accounts.port';

@Injectable()
export class ListLinkedAccountsUseCase {
  constructor(@Inject('LinkedAccountsPort') private readonly accounts: LinkedAccountsPort) {}
  async execute(userId: string): Promise<{ providers: string[] }> {
    return { providers: await this.accounts.list(userId) };
  }
}
