import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import {
  DeckAccessForbiddenException,
  DeckNotFoundException,
  ImportReceiptConflictException,
  VocabImportCardLimitExceededException,
  VocabImportPayloadTooLargeException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { ImportFlashcardsCommand } from '../commands/import-flashcards.command';
import { IMPORT_MAX_CARDS, IMPORT_MAX_PAYLOAD_BYTES } from '../constants/import-limits';
import {
  IMPORT_PAYLOAD_ENCODING,
  IMPORT_PAYLOAD_HASH_ALGORITHM,
  IMPORT_PAYLOAD_HASH_ENCODING,
} from '../constants/import-serialization';
import {
  DeckImportTransactionPort,
  ImportedFlashcardInput,
} from '../ports/deck-import-transaction.port';

interface ImportFlashcardsResult {
  importId: string;
  cardIds: string[];
  importedCount: number;
  idempotent: boolean;
}

@Injectable()
export class ImportFlashcardsUseCase {
  constructor(
    @Inject('DeckImportTransactionPort') private readonly transaction: DeckImportTransactionPort,
  ) {}

  async execute(command: ImportFlashcardsCommand): Promise<ImportFlashcardsResult> {
    if (command.cards.length > IMPORT_MAX_CARDS) {
      throw new VocabImportCardLimitExceededException();
    }

    if (
      Buffer.byteLength(JSON.stringify(command.cards), IMPORT_PAYLOAD_ENCODING) >
      IMPORT_MAX_PAYLOAD_BYTES
    ) {
      throw new VocabImportPayloadTooLargeException();
    }

    const payloadHash = this.createPayloadHash(command.cards);

    return this.transaction.run(async (context) => {
      const deck = await context.deckRepository.findByIdForUpdate(command.deckId);

      if (!deck) throw new DeckNotFoundException(command.deckId);
      if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EDIT, command.userId)) {
        throw new DeckAccessForbiddenException();
      }

      const receipt = await context.receiptRepository.findByUserAndImportId(
        command.userId,
        command.importId,
      );

      if (receipt) {
        if (receipt.deckId !== command.deckId || receipt.payloadHash !== payloadHash) {
          throw new ImportReceiptConflictException();
        }

        return {
          importId: receipt.importId,
          cardIds: receipt.cardIds,
          importedCount: receipt.cardIds.length,
          idempotent: true,
        };
      }

      const cards = await context.flashcardRepository.append(command.deckId, command.cards);
      const cardIds = cards.map((card) => card.id);

      await context.receiptRepository.save({
        userId: command.userId,
        importId: command.importId,
        deckId: command.deckId,
        payloadHash,
        cardIds,
      });

      return {
        importId: command.importId,
        cardIds,
        importedCount: cardIds.length,
        idempotent: false,
      };
    });
  }

  private createPayloadHash(cards: ImportedFlashcardInput[]): string {
    return createHash(IMPORT_PAYLOAD_HASH_ALGORITHM)
      .update(JSON.stringify(cards), IMPORT_PAYLOAD_ENCODING)
      .digest(IMPORT_PAYLOAD_HASH_ENCODING);
  }
}
