import { slugify } from '../../../common/utils/slugify.util';
import { VOCAB_ERRORS } from '../constants/vocab-errors';
import { InvalidDeckDataException } from '../exceptions/vocab-domain.exceptions';

export class DeckSlug {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static fromString(raw: string): DeckSlug {
    const sanitized = slugify(raw);
    if (!sanitized || sanitized.length === 0) {
      throw new InvalidDeckDataException(VOCAB_ERRORS.DECK_SLUG_EMPTY);
    }
    return new DeckSlug(sanitized);
  }

  static createFromTitle(title: string): DeckSlug {
    const slugified = slugify(title);
    const value = slugified.length > 0 ? slugified : 'deck';
    return new DeckSlug(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: DeckSlug): boolean {
    return this._value === other._value;
  }
}
