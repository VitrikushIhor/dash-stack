import { ExportFlashcardsCommand } from '../../../application/commands/export-flashcards.command';
import { ExportFormat } from '../../../application/contracts/export-flashcards.contract';
import { ExportFlashcardsUseCase } from '../../../application/use-cases/export-flashcards.use-case';
import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { DeckVisibility } from '../../../domain/enums/vocab.enums';
import {
  DeckAccessForbiddenException,
  DeckExportLimitExceededException,
} from '../../../domain/exceptions/vocab-domain.exceptions';

describe('ExportFlashcardsUseCase', () => {
  const deck = Deck.create({ id: 'deck-1', ownerUserId: 'owner-1', title: 'My Deck' });
  const cards = [
    Flashcard.reconstitute({
      id: 'card-2',
      deckId: deck.id,
      term: '+formula',
      definition: 'Second',
      example: null,
      imageUrl: null,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Flashcard.reconstitute({
      id: 'card-1',
      deckId: deck.id,
      term: '=formula',
      definition: 'Hello, world',
      example: 'A "quoted" example\nwith a newline',
      imageUrl: 'https://example.test/image.png',
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];
  const createUseCase = (params?: { deck?: Deck | null; cards?: Flashcard[] }) => {
    const deckRepository = { findById: jest.fn().mockResolvedValue(params?.deck ?? deck) };
    const flashcardRepository = {
      findByDeckId: jest.fn().mockResolvedValue(params?.cards ?? cards),
    };

    return new ExportFlashcardsUseCase(deckRepository, flashcardRepository);
  };

  it.each<ExportFormat>(['csv', 'json'])('should_allow_the_owner_to_export_%s', async (format) => {
    await expect(
      createUseCase().execute(new ExportFlashcardsCommand(deck.id, 'owner-1', format)),
    ).resolves.toMatchObject({ format, filename: `my-deck.${format}` });
  });

  it('should_export_csv_in_stable_order_and_escape_formula_and_quoted_content', async () => {
    const result = await createUseCase().execute(
      new ExportFlashcardsCommand(deck.id, 'owner-1', 'csv'),
    );

    expect(result.contentType).toBe('text/csv; charset=utf-8');
    expect(result.data).toBe(
      'term,definition,example,imageUrl\r\n' +
        '\'=formula,"Hello, world","A ""quoted"" example\nwith a newline",https://example.test/image.png\r\n' +
        "'+formula,Second,,",
    );
  });

  it('should_export_a_versioned_json_backup_in_stable_order', async () => {
    const result = await createUseCase().execute(
      new ExportFlashcardsCommand(deck.id, 'owner-1', 'json'),
    );

    expect(result.contentType).toBe('application/json; charset=utf-8');
    expect(JSON.parse(result.data)).toEqual({
      schemaVersion: 1,
      cards: [
        {
          term: '=formula',
          definition: 'Hello, world',
          example: 'A "quoted" example\nwith a newline',
          imageUrl: 'https://example.test/image.png',
        },
        { term: '+formula', definition: 'Second', example: null, imageUrl: null },
      ],
    });
  });

  it('should_reject_a_non_owner_even_for_a_published_public_deck', async () => {
    const publicDeck = Deck.create({
      id: deck.id,
      ownerUserId: 'owner-1',
      title: deck.title,
      visibility: DeckVisibility.PUBLIC,
    });

    await expect(
      createUseCase({ deck: publicDeck }).execute(
        new ExportFlashcardsCommand(deck.id, 'other-user', 'json'),
      ),
    ).rejects.toThrow(DeckAccessForbiddenException);
  });

  it('should_escape_control_prefixed_spreadsheet_formulas', async () => {
    const controlPrefixCard = Flashcard.reconstitute({
      id: 'card-3',
      deckId: deck.id,
      term: '\t=SUM(A1)',
      definition: ' \t+SUM(A1)',
      example: null,
      imageUrl: null,
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await createUseCase({ cards: [controlPrefixCard] }).execute(
      new ExportFlashcardsCommand(deck.id, 'owner-1', 'csv'),
    );

    expect(result.data).toBe("term,definition,example,imageUrl\r\n'\t=SUM(A1),' \t+SUM(A1),,");
  });

  it('should_reject_an_export_that_the_import_contract_cannot_restore', async () => {
    const tooManyCards = Array.from({ length: 2001 }, (_, position) =>
      Flashcard.reconstitute({
        id: `card-${position}`,
        deckId: deck.id,
        term: `term-${position}`,
        definition: `definition-${position}`,
        example: null,
        imageUrl: null,
        position,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(
      createUseCase({ cards: tooManyCards }).execute(
        new ExportFlashcardsCommand(deck.id, 'owner-1', 'json'),
      ),
    ).rejects.toThrow(DeckExportLimitExceededException);
  });
});
