import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { setTimeout } from 'node:timers/promises';
import {
  MatchTransactionContext,
  MatchTransactionPort,
} from '../../application/ports/match-transaction.port';
import { MatchWriteConflictException } from '../../domain/exceptions/match-domain.exceptions';
import { PrismaDeckMapper } from './mappers/prisma-deck.mapper';
import { PrismaMatchRepository } from './prisma-match.repository';
import { isPrismaWriteConflict } from './prisma-write-conflict';

@Injectable()
export class PrismaMatchTransaction implements MatchTransactionPort {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(work: (context: MatchTransactionContext) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) =>
            work({
              deckRepository: {
                findById: async (id) => {
                  const deck = await tx.deck.findUnique({ where: { id } });
                  return deck ? PrismaDeckMapper.toDomain(deck) : null;
                },
              },
              matchRepository: new PrismaMatchRepository(tx),
            }),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000,
          },
        );
      } catch (error: unknown) {
        if (!isPrismaWriteConflict(error)) throw error;
        if (attempt >= 3) throw new MatchWriteConflictException();
        await setTimeout(25 * 2 ** attempt);
      }
    }
  }
}
