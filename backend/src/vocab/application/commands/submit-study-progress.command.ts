export interface StudyResultItem {
  flashcardId: string;
  isCorrect: boolean;
}

export interface SubmitStudyProgressCommand {
  userId: string;
  deckId: string;
  attemptId?: string;
  results: StudyResultItem[];
}
