import { Inject, Injectable } from '@nestjs/common';
import { Deck } from '../../domain/entities/deck.entity';
import { Flashcard } from '../../domain/entities/flashcard.entity';
import {
  DeckAccessForbiddenException,
  DeckExportLimitExceededException,
  DeckNotFoundException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { DeckAccessAction, DeckAccessPolicy } from '../../domain/policies/deck-access.policy';
import { ExportFlashcardsCommand } from '../commands/export-flashcards.command';
import { ExportFormat } from '../contracts/export-flashcards.contract';
import { IMPORT_PAYLOAD_ENCODING } from '../constants/import-serialization';
import {
  IMPORT_MAX_CARDS,
  IMPORT_MAX_PAYLOAD_BYTES,
  IMPORT_TRANSPORT_HEADROOM_BYTES,
} from '../constants/import-limits';

interface ExportDeckReader {
  findById(deckId: string): Promise<Deck | null>;
}

interface ExportFlashcardReader {
  findByDeckId(deckId: string): Promise<Flashcard[]>;
}

interface ExportResult {
  data: string;
  contentType: string;
  filename: string;
  format: ExportFormat;
}

@Injectable()
export class ExportFlashcardsUseCase {
  constructor(
    @Inject('DeckRepositoryPort')
    private readonly deckRepository: ExportDeckReader,
    @Inject('FlashcardRepositoryPort')
    private readonly flashcardRepository: ExportFlashcardReader,
  ) {}

  async execute(command: ExportFlashcardsCommand): Promise<ExportResult> {
    const deck = await this.deckRepository.findById(command.deckId);

    if (!deck) throw new DeckNotFoundException(command.deckId);

    if (!DeckAccessPolicy.canAccess(deck, DeckAccessAction.EXPORT, command.userId)) {
      throw new DeckAccessForbiddenException();
    }

    const cards = await this.flashcardRepository.findByDeckId(command.deckId);

    if (cards.length > IMPORT_MAX_CARDS) {
      throw new DeckExportLimitExceededException();
    }
    const orderedCards = [...cards].sort((left, right) => left.position - right.position);
    const result =
      command.format === 'json'
        ? this.exportJson(deck.title, orderedCards)
        : this.exportCsv(deck.title, orderedCards);

    if (
      Buffer.byteLength(this.serializeImportCards(orderedCards), IMPORT_PAYLOAD_ENCODING) >
      IMPORT_MAX_PAYLOAD_BYTES - IMPORT_TRANSPORT_HEADROOM_BYTES
    ) {
      throw new DeckExportLimitExceededException();
    }

    return result;
  }

  private serializeImportCards(cards: Flashcard[]): string {
    return JSON.stringify(
      cards.map((card) => ({
        term: card.term,
        definition: card.definition,
        example: card.example ?? null,
        imageUrl: card.imageUrl ?? null,
      })),
    );
  }

  private exportJson(title: string, cards: Flashcard[]): ExportResult {
    return {
      data: JSON.stringify({
        schemaVersion: 1,
        cards: cards.map((card) => ({
          term: card.term,
          definition: card.definition,
          example: card.example ?? null,
          imageUrl: card.imageUrl ?? null,
        })),
      }),
      contentType: 'application/json; charset=utf-8',
      filename: `${this.sanitizeFilename(title)}.json`,
      format: 'json',
    };
  }

  private exportCsv(title: string, cards: Flashcard[]): ExportResult {
    const header = 'term,definition,example,imageUrl';
    const rows = cards
      .map((c) =>
        [
          this.escapeCsvField(c.term),
          this.escapeCsvField(c.definition),
          this.escapeCsvField(c.example ?? null),
          this.escapeCsvField(c.imageUrl ?? null),
        ].join(','),
      )
      .join('\r\n');

    return {
      data: [header, rows].filter(Boolean).join('\r\n'),
      contentType: 'text/csv; charset=utf-8',
      filename: `${this.sanitizeFilename(title)}.csv`,
      format: 'csv',
    };
  }

  private escapeCsvField(field: string | null | undefined): string {
    if (!field) return '';

    const sanitized = /^[\t\r\n ]*[=+\-@]/.test(field) ? `'${field}` : field;

    return /[",\r\n]/.test(sanitized) ? `"${sanitized.replace(/"/g, '""')}"` : sanitized;
  }

  private sanitizeFilename(title: string): string {
    const normalized = title
      .normalize('NFKD')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return normalized || 'vocabulary-deck';
  }
}
