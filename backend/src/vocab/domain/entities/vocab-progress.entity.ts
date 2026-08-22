import { VocabProgressStatus } from '../enums/vocab.enums';
import { LeitnerSrsEngine } from '../services/leitner-srs.service';
import { InvalidVocabProgressDataException } from '../exceptions/vocab-domain.exceptions';
import { VOCAB_ERRORS } from '../constants/vocab-errors';

export interface VocabProgressProps {
  id: string;
  userId: string;
  deckId: string;
  flashcardId: string;
  status: VocabProgressStatus;
  box: number;
  isStarred: boolean;
  correctStreak: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class VocabProgress {
  private constructor(private readonly props: VocabProgressProps) {
    this.validate();
  }

  public static createNew(
    userId: string,
    deckId: string,
    flashcardId: string,
    now: Date = new Date(),
    id = '',
  ): VocabProgress {
    return new VocabProgress({
      id,
      userId,
      deckId,
      flashcardId,
      status: VocabProgressStatus.NEW,
      box: 1,
      isStarred: false,
      correctStreak: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
      nextReviewAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: VocabProgressProps): VocabProgress {
    return new VocabProgress({ ...props });
  }

  private validate(): void {
    if (!this.props.userId || this.props.userId.trim() === '') {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_USER_REQUIRED);
    }
    if (!this.props.deckId || this.props.deckId.trim() === '') {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_DECK_REQUIRED);
    }
    if (!this.props.flashcardId || this.props.flashcardId.trim() === '') {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_FLASHCARD_REQUIRED);
    }
    if (this.props.box < 1 || this.props.box > 5) {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_INVALID_BOX);
    }
    if (this.props.correctStreak < 0) {
      throw new InvalidVocabProgressDataException(VOCAB_ERRORS.VOCAB_PROGRESS_NEGATIVE_STREAK);
    }
    if (this.props.correctCount < 0) {
      throw new InvalidVocabProgressDataException(
        VOCAB_ERRORS.VOCAB_PROGRESS_NEGATIVE_CORRECT_COUNT,
      );
    }
    if (this.props.incorrectCount < 0) {
      throw new InvalidVocabProgressDataException(
        VOCAB_ERRORS.VOCAB_PROGRESS_NEGATIVE_INCORRECT_COUNT,
      );
    }
  }

  public recordReview(isCorrect: boolean, now: Date = new Date()): void {
    const srsResult = LeitnerSrsEngine.calculateNextReview({
      currentBox: this.props.box,
      isCorrect,
      currentStreak: this.props.correctStreak,
      correctCount: this.props.correctCount,
      incorrectCount: this.props.incorrectCount,
      now,
    });

    this.props.box = srsResult.nextBox;
    this.props.status = srsResult.status;
    this.props.correctStreak = srsResult.correctStreak;
    this.props.correctCount = srsResult.correctCount;
    this.props.incorrectCount = srsResult.incorrectCount;
    this.props.nextReviewAt = srsResult.nextReviewAt;
    this.props.lastReviewedAt = srsResult.lastReviewedAt;
    this.props.updatedAt = now;
  }

  public toggleStar(): void {
    this.props.isStarred = !this.props.isStarred;
    this.props.updatedAt = new Date();
  }

  public setStar(isStarred: boolean): void {
    this.props.isStarred = isStarred;
    this.props.updatedAt = new Date();
  }

  // Getters
  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get deckId(): string {
    return this.props.deckId;
  }

  public get flashcardId(): string {
    return this.props.flashcardId;
  }

  public get status(): VocabProgressStatus {
    return this.props.status;
  }

  public get box(): number {
    return this.props.box;
  }

  public get isStarred(): boolean {
    return this.props.isStarred;
  }

  public get correctStreak(): number {
    return this.props.correctStreak;
  }

  public get correctCount(): number {
    return this.props.correctCount;
  }

  public get incorrectCount(): number {
    return this.props.incorrectCount;
  }

  public get lastReviewedAt(): Date | null {
    return this.props.lastReviewedAt;
  }

  public get nextReviewAt(): Date | null {
    return this.props.nextReviewAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public toSnapshot(): VocabProgressProps {
    return { ...this.props };
  }
}
