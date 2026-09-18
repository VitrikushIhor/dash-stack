import { InvalidFlashcardDataException } from '../exceptions/vocab-domain.exceptions';
import { VOCAB_ERRORS } from '../constants/vocab-errors';

interface FlashcardProps {
  id: string;
  deckId: string;
  term: string;
  definition: string;
  example?: string | null;
  imageUrl?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Flashcard {
  private constructor(private readonly props: FlashcardProps) {
    this.validate();
  }

  static create(
    props: Omit<FlashcardProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Flashcard {
    const id = props.id || '';
    const now = new Date();
    return new Flashcard({
      ...props,
      id,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: FlashcardProps): Flashcard {
    return new Flashcard(props);
  }

  private validate(): void {
    if (!this.props.deckId || this.props.deckId.trim().length === 0) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_DECK_REQUIRED);
    }
    if (!this.props.term || this.props.term.trim().length === 0) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_TERM_REQUIRED);
    }
    if (this.props.term.length > 255) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_TERM_TOO_LONG);
    }
    if (!this.props.definition || this.props.definition.trim().length === 0) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_DEFINITION_REQUIRED);
    }
    if (this.props.definition.length > 1000) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_DEFINITION_TOO_LONG);
    }
    if (this.props.example && this.props.example.length > 500) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_EXAMPLE_TOO_LONG);
    }
    if (this.props.position < 0) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_POSITION_NEGATIVE);
    }
  }

  get id(): string {
    return this.props.id;
  }

  get deckId(): string {
    return this.props.deckId;
  }

  get term(): string {
    return this.props.term;
  }

  get definition(): string {
    return this.props.definition;
  }

  get example(): string | null | undefined {
    return this.props.example;
  }

  get imageUrl(): string | null | undefined {
    return this.props.imageUrl;
  }

  get position(): number {
    return this.props.position;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateContent(data: {
    term?: string;
    definition?: string;
    example?: string | null;
    imageUrl?: string | null;
  }): void {
    if (data.term !== undefined) this.props.term = data.term;
    if (data.definition !== undefined) this.props.definition = data.definition;
    if (data.example !== undefined) this.props.example = data.example;
    if (data.imageUrl !== undefined) this.props.imageUrl = data.imageUrl;
    this.props.updatedAt = new Date();
    this.validate();
  }

  updatePosition(newPosition: number): void {
    if (newPosition < 0) {
      throw new InvalidFlashcardDataException(VOCAB_ERRORS.FLASHCARD_POSITION_NEGATIVE);
    }
    this.props.position = newPosition;
    this.props.updatedAt = new Date();
  }
}
