import { Deck } from '../../../domain/entities/deck.entity';
import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { DeckStatus, DeckType, DeckVisibility } from '../../../domain/enums/vocab.enums';
import { DeckEditorFlashcardsMissingException } from '../../../domain/exceptions/vocab-domain.exceptions';
import { DeckPresentationMapper } from '../../../presentation/mappers/deck-presentation.mapper';

describe('DeckPresentationMapper.toEditorResponse', () => {
  const now = new Date('2026-09-06T12:00:00.000Z');

  function createDeck(flashcards?: Flashcard[]): Deck {
    return Deck.reconstitute({
      id: 'deck-1',
      ownerUserId: 'user-1',
      title: 'English basics',
      description: null,
      language: 'en',
      level: null,
      tags: [],
      visibility: DeckVisibility.PRIVATE,
      status: DeckStatus.DRAFT,
      type: DeckType.USER_GENERATED,
      cardCount: flashcards?.length ?? 0,
      flashcards,
      createdAt: now,
      updatedAt: now,
    });
  }

  it('should_return_flashcards_when_editor_save_result_includes_them', () => {
    const card = Flashcard.reconstitute({
      id: 'card-1',
      deckId: 'deck-1',
      term: 'hello',
      definition: 'a greeting',
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const response = DeckPresentationMapper.toEditorResponse(createDeck([card]));

    expect(response.flashcards).toEqual([expect.objectContaining({ id: 'card-1', term: 'hello' })]);
  });

  it('should_fail_when_editor_save_result_omits_flashcards', () => {
    expect(() => DeckPresentationMapper.toEditorResponse(createDeck())).toThrow(
      DeckEditorFlashcardsMissingException,
    );
  });
});
