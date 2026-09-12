export interface StudyAttemptReceipt {
  userId: string;
  attemptId: string;
  deckId: string;
  flashcardId: string;
  isCorrect: boolean;
}

export interface StudyAttemptRepositoryPort {
  find(userId: string, attemptId: string): Promise<StudyAttemptReceipt | null>;
  save(receipt: StudyAttemptReceipt): Promise<void>;
}
