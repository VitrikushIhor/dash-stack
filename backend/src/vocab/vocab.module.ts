import { PrismaStudyProgressTransaction } from './infrastructure/persistence/prisma-study-progress-transaction';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { MatchController } from './presentation/controllers/match.controller';
import { PrismaMatchTransaction } from './infrastructure/persistence/prisma-match-transaction';
import { CreateMatchSessionUseCase } from './application/use-cases/create-match-session.use-case';
import { CompleteMatchSessionUseCase } from './application/use-cases/complete-match-session.use-case';
import { GetMatchLeaderboardUseCase } from './application/use-cases/get-match-leaderboard.use-case';
import { RecordMatchPairUseCase } from './application/use-cases/record-match-pair.use-case';
import { PrismaDeckRepository } from './infrastructure/persistence/prisma-deck.repository';
import { PrismaFlashcardRepository } from './infrastructure/persistence/prisma-flashcard.repository';
import { PrismaDeckEditorRepository } from './infrastructure/persistence/prisma-deck-editor.repository';
import { PrismaVocabProgressRepository } from './infrastructure/persistence/prisma-vocab-progress.repository';
import { UnsplashAdapter } from './infrastructure/integrations/unsplash.adapter';
import { CreateDeckUseCase } from './application/use-cases/create-deck.use-case';
import { GetMyDecksUseCase } from './application/use-cases/get-my-decks.use-case';
import { GetDeckByIdUseCase } from './application/use-cases/get-deck-by-id.use-case';
import { UpdateDeckUseCase } from './application/use-cases/update-deck.use-case';
import { SaveDeckEditorUseCase } from './application/use-cases/save-deck-editor.use-case';
import { DeleteDeckUseCase } from './application/use-cases/delete-deck.use-case';
import { PublishDeckUseCase } from './application/use-cases/publish-deck.use-case';
import { UnpublishDeckUseCase } from './application/use-cases/unpublish-deck.use-case';
import { ArchiveDeckUseCase } from './application/use-cases/archive-deck.use-case';
import { RestoreDeckUseCase } from './application/use-cases/restore-deck.use-case';
import { ForkDeckUseCase } from './application/use-cases/fork-deck.use-case';
import { SearchPublicDecksUseCase } from './application/use-cases/search-public-decks.use-case';
import { CreateFlashcardUseCase } from './application/use-cases/create-flashcard.use-case';
import { UpdateFlashcardUseCase } from './application/use-cases/update-flashcard.use-case';
import { DeleteFlashcardUseCase } from './application/use-cases/delete-flashcard.use-case';
import { ReorderFlashcardsUseCase } from './application/use-cases/reorder-flashcards.use-case';
import { SearchUnsplashPhotosUseCase } from './application/use-cases/search-unsplash-photos.use-case';
import { GetDueReviewsUseCase } from './application/use-cases/get-due-reviews.use-case';
import { GetStudyCardsUseCase } from './application/use-cases/get-study-cards.use-case';
import { BrowseDeckCardsUseCase } from './application/use-cases/browse-deck-cards.use-case';
import { SubmitStudyProgressUseCase } from './application/use-cases/submit-study-progress.use-case';
import { ToggleCardStarUseCase } from './application/use-cases/toggle-card-star.use-case';
import { DeckController } from './presentation/controllers/deck.controller';
import { FlashcardController } from './presentation/controllers/flashcard.controller';
import { UnsplashController } from './presentation/controllers/unsplash.controller';
import { VocabProgressController } from './presentation/controllers/vocab-progress.controller';
import { DeckStudyController } from './presentation/controllers/deck-study.controller';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
  controllers: [
    MatchController,
    DeckController,
    FlashcardController,
    UnsplashController,
    VocabProgressController,
    DeckStudyController,
  ],
  providers: [
    CreateMatchSessionUseCase,
    CompleteMatchSessionUseCase,
    GetMatchLeaderboardUseCase,
    RecordMatchPairUseCase,
    PrismaMatchTransaction,
    { provide: 'MatchTransactionPort', useExisting: PrismaMatchTransaction },
    { provide: 'MatchClockPort', useValue: { now: () => new Date() } },
    // Use Cases - Decks
    CreateDeckUseCase,
    GetMyDecksUseCase,
    GetDeckByIdUseCase,
    UpdateDeckUseCase,
    SaveDeckEditorUseCase,
    DeleteDeckUseCase,
    PublishDeckUseCase,
    UnpublishDeckUseCase,
    ArchiveDeckUseCase,
    RestoreDeckUseCase,
    ForkDeckUseCase,
    SearchPublicDecksUseCase,

    // Use Cases - Flashcards
    CreateFlashcardUseCase,
    UpdateFlashcardUseCase,
    DeleteFlashcardUseCase,
    ReorderFlashcardsUseCase,

    // Use Cases - Unsplash
    SearchUnsplashPhotosUseCase,

    // Use Cases - SRS & Study Progress
    GetDueReviewsUseCase,
    GetStudyCardsUseCase,
    BrowseDeckCardsUseCase,
    SubmitStudyProgressUseCase,
    ToggleCardStarUseCase,

    PrismaStudyProgressTransaction,
    { provide: 'StudyProgressTransactionPort', useExisting: PrismaStudyProgressTransaction },
    // Repositories, Adapters & Ports
    PrismaDeckRepository,
    {
      provide: 'DeckRepositoryPort',
      useExisting: PrismaDeckRepository,
    },
    PrismaFlashcardRepository,
    {
      provide: 'FlashcardRepositoryPort',
      useExisting: PrismaFlashcardRepository,
    },
    PrismaDeckEditorRepository,
    {
      provide: 'DeckEditorRepositoryPort',
      useExisting: PrismaDeckEditorRepository,
    },
    PrismaVocabProgressRepository,
    {
      provide: 'VocabProgressRepositoryPort',
      useExisting: PrismaVocabProgressRepository,
    },
    UnsplashAdapter,
    {
      provide: 'UnsplashServicePort',
      useExisting: UnsplashAdapter,
    },
  ],
  exports: [
    GetDeckByIdUseCase,
    CreateDeckUseCase,
    ForkDeckUseCase,
    SearchUnsplashPhotosUseCase,
    GetDueReviewsUseCase,
    GetStudyCardsUseCase,
    SubmitStudyProgressUseCase,
    ToggleCardStarUseCase,
    'DeckRepositoryPort',
    'FlashcardRepositoryPort',
    'VocabProgressRepositoryPort',
    'UnsplashServicePort',
  ],
})
export class VocabModule {}
