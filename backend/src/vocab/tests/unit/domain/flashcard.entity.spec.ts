import { Flashcard } from '../../../domain/entities/flashcard.entity';
import { InvalidFlashcardDataException } from '../../../domain/exceptions/vocab-domain.exceptions';

describe('Flashcard Entity', () => {
  const validProps = {
    deckId: 'deck-123',
    term: 'serendipity',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    example: 'A fortunate stroke of serendipity brought them together.',
    imageUrl: 'https://example.com/serendipity.jpg',
    position: 1,
  };

  it('should create a valid flashcard', () => {
    const card = Flashcard.create(validProps);

    expect(card.deckId).toBe('deck-123');
    expect(card.term).toBe('serendipity');
    expect(card.definition).toBe(validProps.definition);
    expect(card.example).toBe(validProps.example);
    expect(card.imageUrl).toBe(validProps.imageUrl);
    expect(card.position).toBe(1);
    expect(card.createdAt).toBeDefined();
    expect(card.updatedAt).toBeDefined();
  });

  it('should throw when term is empty', () => {
    expect(() => {
      Flashcard.create({ ...validProps, term: '' });
    }).toThrow(InvalidFlashcardDataException);
  });

  it('should throw when definition is empty', () => {
    expect(() => {
      Flashcard.create({ ...validProps, definition: '   ' });
    }).toThrow(InvalidFlashcardDataException);
  });

  it('should throw when term exceeds 255 chars', () => {
    expect(() => {
      Flashcard.create({ ...validProps, term: 'a'.repeat(256) });
    }).toThrow(InvalidFlashcardDataException);
  });

  it('should throw when definition exceeds 1000 chars', () => {
    expect(() => {
      Flashcard.create({ ...validProps, definition: 'a'.repeat(1001) });
    }).toThrow(InvalidFlashcardDataException);
  });

  it('should throw when example exceeds 500 chars', () => {
    expect(() => {
      Flashcard.create({ ...validProps, example: 'a'.repeat(501) });
    }).toThrow(InvalidFlashcardDataException);
  });

  it('should update content properly', () => {
    const card = Flashcard.create(validProps);
    card.updateContent({
      term: 'epiphany',
      definition: 'A moment of sudden revelation or insight.',
    });

    expect(card.term).toBe('epiphany');
    expect(card.definition).toBe('A moment of sudden revelation or insight.');
  });

  it('should update position properly', () => {
    const card = Flashcard.create(validProps);
    card.updatePosition(5);
    expect(card.position).toBe(5);

    expect(() => card.updatePosition(-1)).toThrow(InvalidFlashcardDataException);
  });
});
