import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  InternalErrorException,
} from '../../../common/exceptions/domain.exception';
import { VOCAB_ERRORS } from '../constants/vocab-errors';

export class DeckNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(VOCAB_ERRORS.DECK_NOT_FOUND(identifier));
  }
}

export class DeckAccessForbiddenException extends ForbiddenException {
  constructor(message = VOCAB_ERRORS.DECK_FORBIDDEN) {
    super(message);
  }
}

export class DeckPublishInvalidException extends BadRequestException {
  constructor(cardCount: number) {
    super(VOCAB_ERRORS.DECK_PUBLISH_MIN_CARDS(cardCount));
  }
}

export class DeckLifecycleInvalidTransitionException extends ConflictException {
  constructor(from: string, to: string) {
    super(VOCAB_ERRORS.DECK_LIFECYCLE_INVALID_TRANSITION(from, to));
  }
}

export class FlashcardNotFoundException extends NotFoundException {
  constructor(cardId: string) {
    super(VOCAB_ERRORS.FLASHCARD_NOT_FOUND(cardId));
  }
}

export class InvalidDeckDataException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidFlashcardDataException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class VocabProgressNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(VOCAB_ERRORS.VOCAB_PROGRESS_NOT_FOUND(identifier));
  }
}

export class FlashcardNotInDeckException extends BadRequestException {
  constructor(cardId: string, deckId: string) {
    super(VOCAB_ERRORS.FLASHCARD_NOT_IN_DECK(cardId, deckId));
  }
}

export class InvalidVocabProgressDataException extends BadRequestException {
  constructor(reason: string) {
    super(VOCAB_ERRORS.INVALID_PROGRESS_DATA(reason));
  }
}

export class PersonalizedStudyFilterAuthRequiredException extends BadRequestException {
  constructor() {
    super(VOCAB_ERRORS.PERSONALIZED_STUDY_FILTER_AUTH_REQUIRED);
  }
}

export class DeckEditorFlashcardsMissingException extends InternalErrorException {
  constructor() {
    super(VOCAB_ERRORS.DECK_EDITOR_FLASHCARDS_REQUIRED);
  }
}

export class VocabProgressConflictException extends ConflictException {
  constructor() {
    super('Progress changed concurrently. Please submit the review again.');
  }
}
