export const VOCAB_ERRORS = {
  DECK_NOT_FOUND: (identifier: string) => `Deck not found: ${identifier}`,
  DECK_FORBIDDEN: 'You do not have permission to access or modify this deck',
  DECK_PUBLISH_MIN_CARDS: (cardCount: number) =>
    `Cannot publish deck. A minimum of 2 flashcards is required to publish, but this deck has ${cardCount}.`,
  DECK_TITLE_REQUIRED: 'Deck title is required and cannot be empty',
  DECK_TITLE_TOO_LONG: 'Deck title cannot exceed 100 characters',
  DECK_OWNER_REQUIRED: 'Deck must belong to an owner',
  DECK_SLUG_EMPTY: 'Slug cannot be empty',
  FLASHCARD_NOT_FOUND: (cardId: string) => `Flashcard not found: ${cardId}`,
  FLASHCARD_DECK_REQUIRED: 'Flashcard must belong to a deck',
  FLASHCARD_TERM_REQUIRED: 'Flashcard term is required and cannot be empty',
  FLASHCARD_TERM_TOO_LONG: 'Flashcard term cannot exceed 255 characters',
  FLASHCARD_DEFINITION_REQUIRED: 'Flashcard definition is required and cannot be empty',
  FLASHCARD_DEFINITION_TOO_LONG: 'Flashcard definition cannot exceed 1000 characters',
  FLASHCARD_EXAMPLE_TOO_LONG: 'Flashcard example cannot exceed 500 characters',
  FLASHCARD_POSITION_NEGATIVE: 'Flashcard position must be non-negative',
} as const;
