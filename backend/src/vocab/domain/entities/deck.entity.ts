import { CEFRLevel, DeckStatus, DeckType, DeckVisibility } from '../enums/vocab.enums';
import { InvalidDeckDataException } from '../exceptions/vocab-domain.exceptions';
import { DeckLifecyclePolicy } from '../policies/deck-lifecycle.policy';
import { VOCAB_ERRORS } from '../constants/vocab-errors';
import { Flashcard } from './flashcard.entity';

export interface DeckProps {
  id: string;
  ownerUserId: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  language: string;
  level?: CEFRLevel | null;
  tags: string[];
  visibility: DeckVisibility;
  status: DeckStatus;
  type: DeckType;
  forkedFromDeckId?: string | null;
  cardCount?: number;
  flashcards?: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export class Deck {
  private constructor(private readonly props: DeckProps) {
    this.validate();
  }

  static create(
    props: Omit<
      DeckProps,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'type' | 'language' | 'tags' | 'visibility'
    > & {
      id?: string;
      status?: DeckStatus;
      type?: DeckType;
      language?: string;
      tags?: string[];
      visibility?: DeckVisibility;
    },
  ): Deck {
    const id = props.id || '';
    const now = new Date();
    return new Deck({
      ...props,
      id,
      language: props.language || 'en',
      tags: props.tags || [],
      visibility: props.visibility || DeckVisibility.PRIVATE,
      status: props.status || DeckStatus.DRAFT,
      type: props.type || DeckType.USER_GENERATED,
      cardCount: props.cardCount ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: DeckProps): Deck {
    return new Deck(props);
  }

  static fork(sourceDeck: Deck, newOwnerUserId: string, newSlug: string): Deck {
    const baseTitle = `Copy of ${sourceDeck.title}`;
    const truncatedTitle = baseTitle.length > 100 ? baseTitle.slice(0, 100) : baseTitle;

    return Deck.create({
      ownerUserId: newOwnerUserId,
      title: truncatedTitle,
      slug: newSlug,
      description: sourceDeck.description,
      language: sourceDeck.language,
      level: sourceDeck.level,
      tags: [...sourceDeck.tags],
      visibility: DeckVisibility.PRIVATE,
      status: DeckStatus.DRAFT,
      type: DeckType.USER_GENERATED,
      forkedFromDeckId: sourceDeck.id,
    });
  }

  private validate(): void {
    if (!this.props.ownerUserId || this.props.ownerUserId.trim().length === 0) {
      throw new InvalidDeckDataException(VOCAB_ERRORS.DECK_OWNER_REQUIRED);
    }
    if (!this.props.title || this.props.title.trim().length === 0) {
      throw new InvalidDeckDataException(VOCAB_ERRORS.DECK_TITLE_REQUIRED);
    }
    if (this.props.title.length > 100) {
      throw new InvalidDeckDataException(VOCAB_ERRORS.DECK_TITLE_TOO_LONG);
    }
  }

  get id(): string {
    return this.props.id;
  }

  get ownerUserId(): string {
    return this.props.ownerUserId;
  }

  get title(): string {
    return this.props.title;
  }

  get slug(): string | null | undefined {
    return this.props.slug;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get language(): string {
    return this.props.language;
  }

  get level(): CEFRLevel | null | undefined {
    return this.props.level;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get visibility(): DeckVisibility {
    return this.props.visibility;
  }

  get status(): DeckStatus {
    return this.props.status;
  }

  get type(): DeckType {
    return this.props.type;
  }

  get forkedFromDeckId(): string | null | undefined {
    return this.props.forkedFromDeckId;
  }

  get cardCount(): number {
    return this.props.cardCount ?? this.props.flashcards?.length ?? 0;
  }

  get flashcards(): Flashcard[] | undefined {
    return this.props.flashcards;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isOwnedBy(userId: string): boolean {
    return this.props.ownerUserId === userId;
  }

  isAccessibleBy(userId?: string | null): boolean {
    if (
      this.props.visibility === DeckVisibility.PUBLIC ||
      this.props.visibility === DeckVisibility.UNLISTED
    ) {
      return true;
    }
    if (!userId) {
      return false;
    }
    return this.isOwnedBy(userId);
  }

  updateMetadata(data: {
    title?: string;
    description?: string | null;
    level?: CEFRLevel | null;
    tags?: string[];
    visibility?: DeckVisibility;
    language?: string;
  }): void {
    if (data.title !== undefined) this.props.title = data.title;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.level !== undefined) this.props.level = data.level;
    if (data.tags !== undefined) this.props.tags = data.tags;
    if (data.visibility !== undefined) this.props.visibility = data.visibility;
    if (data.language !== undefined) this.props.language = data.language;
    this.props.updatedAt = new Date();
    this.validate();
  }

  publish(currentCardCount: number): void {
    DeckLifecyclePolicy.validatePublishEligibility(currentCardCount);
    this.props.status = DeckStatus.PUBLISHED;
    this.props.updatedAt = new Date();
  }

  unpublish(): void {
    this.props.status = DeckStatus.DRAFT;
    this.props.updatedAt = new Date();
  }

  archive(): void {
    this.props.status = DeckStatus.ARCHIVED;
    this.props.updatedAt = new Date();
  }

  restore(): void {
    this.props.status = DeckStatus.DRAFT;
    this.props.updatedAt = new Date();
  }
}
