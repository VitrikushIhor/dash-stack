import { SetCardStarUseCase } from '../../application/use-cases/set-card-star.use-case';
import { Prisma, DeckStatus, DeckVisibility } from '@prisma/client';
import {
  VocabProgressConflictException,
  DeckAccessForbiddenException,
  FlashcardNotInDeckException,
  InvalidVocabProgressDataException,
} from '../../domain/exceptions/vocab-domain.exceptions';
import { ToggleCardStarUseCase } from '../../application/use-cases/toggle-card-star.use-case';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaService } from 'nestjs-prisma';
import { SubmitStudyProgressUseCase } from '../../application/use-cases/submit-study-progress.use-case';
import { PrismaStudyProgressTransaction } from '../../infrastructure/persistence/prisma-study-progress-transaction';
import { PrismaVocabProgressRepository } from '../../infrastructure/persistence/prisma-vocab-progress.repository';
import { VocabProgress } from '../../domain/entities/vocab-progress.entity';
import { VOCAB_ERRORS } from '../../domain/constants/vocab-errors';

config({ path: resolve(__dirname, '../../../../.env'), quiet: true });
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('DATABASE_URL is required for Vocabulary integration tests');

describe('Vocabulary progress integration', () => {
  let pool: Pool;
  let prisma: PrismaService;
  let repository: PrismaVocabProgressRepository;
  let submit: SubmitStudyProgressUseCase;
  let userId: string;
  const createDeck = (count = 2) =>
    prisma.deck.create({
      data: {
        ownerUserId: userId,
        title: 'SRS integration',
        flashcards: {
          create: Array.from({ length: count }, (_, position) => ({
            term: `Term ${position}`,
            definition: `Definition ${position}`,
            position,
          })),
        },
      },
      include: { flashcards: { orderBy: { position: 'asc' } } },
    });

  beforeAll(() => {
    pool = new Pool({ connectionString: databaseUrl });
    prisma = new PrismaService({ prismaOptions: { adapter: new PrismaPg(pool) } });
    repository = new PrismaVocabProgressRepository(prisma);
    submit = new SubmitStudyProgressUseCase(new PrismaStudyProgressTransaction(prisma));
  });
  beforeEach(async () => {
    userId = `srs-integration-${randomUUID()}`;
    await prisma.user.create({ data: { id: userId, email: `${userId}@example.test` } });
  });
  afterEach(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it.each([true, false])('should_preserve_requested_star_%s_when_retried', async (isStarred) => {
    const deck = await createDeck();
    const star = new SetCardStarUseCase(new PrismaStudyProgressTransaction(prisma));
    const command = { userId, flashcardId: deck.flashcards[0].id, isStarred };

    await Promise.all([star.execute(command), star.execute(command)]);
    expect(await star.execute(command)).toEqual({ flashcardId: command.flashcardId, isStarred });
    const rows = await prisma.vocabProgress.findMany({ where: { deckId: deck.id } });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      isStarred,
      correctCount: 0,
      incorrectCount: 0,
      box: 1,
      nextReviewAt: null,
    });
  });

  it('should_preserve_every_review_when_first_submissions_run_concurrently', async () => {
    const deck = await createDeck();
    const command = {
      userId,
      deckId: deck.id,
      results: deck.flashcards.map((card) => ({ flashcardId: card.id, isCorrect: true })),
    };

    await Promise.all([submit.execute(command), submit.execute(command), submit.execute(command)]);

    const rows = await prisma.vocabProgress.findMany({ where: { deckId: deck.id, userId } });

    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toMatchObject({ box: 4, correctCount: 3, correctStreak: 3, incorrectCount: 0 });
    }
  });

  it('should_record_one_review_when_the_same_learn_attempt_is_retried_concurrently', async () => {
    const deck = await createDeck();
    const command = {
      userId,
      deckId: deck.id,
      attemptId: randomUUID(),
      results: [{ flashcardId: deck.flashcards[0].id, isCorrect: true }],
    };

    await Promise.all([submit.execute(command), submit.execute(command), submit.execute(command)]);
    await submit.execute(command);

    const progress = await prisma.vocabProgress.findFirstOrThrow({
      where: { userId, deckId: deck.id },
    });

    expect(progress).toMatchObject({ box: 2, correctCount: 1, correctStreak: 1 });
  });

  it('should_record_each_distinct_learn_attempt_when_the_card_is_repeated', async () => {
    const deck = await createDeck();
    const command = {
      userId,
      deckId: deck.id,
      attemptId: randomUUID(),
      results: [{ flashcardId: deck.flashcards[0].id, isCorrect: true }],
    };

    await submit.execute(command);
    await submit.execute({ ...command, attemptId: randomUUID() });

    const progress = await prisma.vocabProgress.findFirstOrThrow({
      where: { userId, deckId: deck.id },
    });

    expect(progress).toMatchObject({ box: 3, correctCount: 2, correctStreak: 2 });
  });

  it('should_reject_reused_attempt_id_when_the_answer_changes', async () => {
    const deck = await createDeck();
    const command = {
      userId,
      deckId: deck.id,
      attemptId: randomUUID(),
      results: [{ flashcardId: deck.flashcards[0].id, isCorrect: true }],
    };

    await submit.execute(command);

    await expect(
      submit.execute({
        ...command,
        results: [{ flashcardId: deck.flashcards[0].id, isCorrect: false }],
      }),
    ).rejects.toThrow(VOCAB_ERRORS.STUDY_ATTEMPT_CONFLICT);
    expect(
      await prisma.vocabProgress.findFirstOrThrow({ where: { userId, deckId: deck.id } }),
    ).toMatchObject({ box: 2, correctCount: 1, incorrectCount: 0 });
  });

  it('should_roll_back_all_chunks_when_a_later_write_fails', async () => {
    const deck = await createDeck(100);
    const progress = deck.flashcards.map((card) =>
      VocabProgress.createNew(userId, deck.id, card.id),
    );

    progress.push(VocabProgress.createNew(userId, deck.id, randomUUID()));
    progress.forEach((item) => item.recordReview(true));

    await expect(repository.upsertBatch(progress)).rejects.toThrow();

    expect(await prisma.vocabProgress.count({ where: { deckId: deck.id } })).toBe(0);
  });
  it('should_not_schedule_reviews_when_an_unseen_card_is_starred', async () => {
    const deck = await createDeck();
    const star = new ToggleCardStarUseCase(new PrismaStudyProgressTransaction(prisma));

    await star.execute({ userId, flashcardId: deck.flashcards[0].id });
    const progress = await prisma.vocabProgress.findFirstOrThrow({ where: { deckId: deck.id } });

    expect(progress).toMatchObject({
      isStarred: true,
      nextReviewAt: null,
      lastReviewedAt: null,
      correctCount: 0,
      incorrectCount: 0,
    });
    expect(await repository.getDueReviews(userId, deck.id)).toMatchObject({ totalDue: 0 });
    expect(await repository.getStudyCards(userId, deck.id, { onlyDue: true })).toEqual([]);
    expect(await repository.getStudyCards(userId, deck.id, { onlyStarred: true })).toHaveLength(1);
  });

  it.each([
    '2026-03-29T02:59:59.999+02:00',
    '2026-10-25T03:00:00.000+02:00',
    '2026-09-07T00:00:00.000+03:00',
  ])(
    'should_align_due_counts_and_study_at_the_exact_boundary_when_clock_is_%s',
    async (instant) => {
      const deck = await createDeck(5);
      const now = new Date(instant);

      await prisma.vocabProgress.createMany({
        data: [
          {
            userId,
            deckId: deck.id,
            flashcardId: deck.flashcards[0].id,
            nextReviewAt: new Date(now.getTime() - 1),
            isStarred: false,
          },
          {
            userId,
            deckId: deck.id,
            flashcardId: deck.flashcards[1].id,
            nextReviewAt: now,
            isStarred: true,
          },
          {
            userId,
            deckId: deck.id,
            flashcardId: deck.flashcards[2].id,
            nextReviewAt: new Date(now.getTime() + 1),
            isStarred: true,
          },
          {
            userId,
            deckId: deck.id,
            flashcardId: deck.flashcards[3].id,
            nextReviewAt: null,
            isStarred: true,
          },
        ],
      });
      jest.useFakeTimers({
        now,
        doNotFake: [
          'nextTick',
          'setImmediate',
          'clearImmediate',
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
          'hrtime',
          'performance',
        ],
      });
      try {
        const due = await repository.getStudyCards(userId, deck.id, { onlyDue: true });

        expect(due.map((card) => card.id)).toEqual([deck.flashcards[0].id, deck.flashcards[1].id]);
        expect(await repository.getDueReviews(userId, deck.id)).toMatchObject({
          totalDue: due.length,
        });
        expect(await repository.getDueReviews(userId)).toMatchObject({ totalDue: due.length });
        const starredDue = await repository.getStudyCards(userId, deck.id, {
          onlyDue: true,
          onlyStarred: true,
        });

        expect(starredDue.map((card) => card.id)).toEqual([deck.flashcards[1].id]);
      } finally {
        jest.useRealTimers();
      }
    },
  );
  it('should_preserve_srs_and_star_state_when_reviews_and_star_writes_overlap', async () => {
    const deck = await createDeck();
    const cardId = deck.flashcards[0].id;
    const command = {
      userId,
      deckId: deck.id,
      results: [{ flashcardId: cardId, isCorrect: true }],
    };

    await submit.execute(command);
    const star = new SetCardStarUseCase(new PrismaStudyProgressTransaction(prisma));

    await Promise.all([
      submit.execute(command),
      star.execute({ userId, flashcardId: cardId, isStarred: true }),
    ]);

    const progress = await prisma.vocabProgress.findFirstOrThrow({ where: { deckId: deck.id } });

    expect(progress).toMatchObject({ isStarred: true, box: 3, correctCount: 2, correctStreak: 2 });
  });
  it('should_hide_other_users_progress_when_guest_reads_a_deck', async () => {
    const deck = await createDeck();

    await submit.execute({
      userId,
      deckId: deck.id,
      results: [{ flashcardId: deck.flashcards[0].id, isCorrect: true }],
    });
    const cards = await repository.getStudyCards(null, deck.id);

    expect(
      cards.every(
        (card) =>
          card.progress.id === null && card.progress.correctCount === 0 && !card.progress.isStarred,
      ),
    ).toBe(true);
  });

  it('should_reject_the_entire_batch_when_a_card_belongs_to_another_deck', async () => {
    const deck = await createDeck();
    const otherDeck = await createDeck();

    await expect(
      submit.execute({
        userId,
        deckId: deck.id,
        results: [
          { flashcardId: deck.flashcards[0].id, isCorrect: true },
          { flashcardId: otherDeck.flashcards[0].id, isCorrect: true },
        ],
      }),
    ).rejects.toThrow(FlashcardNotInDeckException);
    expect(await prisma.vocabProgress.count({ where: { userId } })).toBe(0);
  });

  it('should_reject_duplicates_without_writes_when_the_same_card_is_submitted_twice', async () => {
    const deck = await createDeck();

    await expect(
      submit.execute({
        userId,
        deckId: deck.id,
        results: [
          { flashcardId: deck.flashcards[0].id, isCorrect: true },
          { flashcardId: deck.flashcards[0].id, isCorrect: false },
        ],
      }),
    ).rejects.toThrow(InvalidVocabProgressDataException);
    expect(await prisma.vocabProgress.count({ where: { userId } })).toBe(0);
  });

  it.each([
    [DeckStatus.DRAFT, DeckVisibility.PUBLIC],
    [DeckStatus.ARCHIVED, DeckVisibility.PUBLIC],
    [DeckStatus.PUBLISHED, DeckVisibility.PRIVATE],
  ])(
    'should_deny_progress_without_writes_when_non_owner_accesses_%s_%s',
    async (status, visibility) => {
      const deck = await createDeck();

      await prisma.deck.update({ where: { id: deck.id }, data: { status, visibility } });
      await expect(
        submit.execute({
          userId: 'unauthorized-learner',
          deckId: deck.id,
          results: [{ flashcardId: deck.flashcards[0].id, isCorrect: true }],
        }),
      ).rejects.toThrow(DeckAccessForbiddenException);
      expect(await prisma.vocabProgress.count({ where: { deckId: deck.id } })).toBe(0);
    },
  );

  it('should_roll_back_and_surface_conflict_when_retry_budget_is_exhausted', async () => {
    const deck = await createDeck();
    const transaction = new PrismaStudyProgressTransaction(prisma);
    let attempts = 0;

    await expect(
      transaction.run(async (context) => {
        attempts += 1;
        const progress = VocabProgress.createNew(userId, deck.id, deck.flashcards[0].id);

        progress.recordReview(true);
        await context.vocabProgressRepository.save(progress);
        throw new Prisma.PrismaClientKnownRequestError('Write conflict', {
          code: 'P2034',
          clientVersion: Prisma.prismaVersion.client,
        });
      }),
    ).rejects.toThrow(VocabProgressConflictException);
    expect(attempts).toBe(4);
    expect(await prisma.vocabProgress.count({ where: { deckId: deck.id } })).toBe(0);
  });

  it('should_not_retry_or_persist_when_the_callback_raises_a_domain_error', async () => {
    const deck = await createDeck();
    let attempts = 0;

    await expect(
      new PrismaStudyProgressTransaction(prisma).run(async (context) => {
        attempts += 1;
        await context.vocabProgressRepository.save(
          VocabProgress.createNew(userId, deck.id, deck.flashcards[0].id),
        );
        throw new InvalidVocabProgressDataException('Invalid batch');
      }),
    ).rejects.toThrow(InvalidVocabProgressDataException);
    expect(attempts).toBe(1);
    expect(await prisma.vocabProgress.count({ where: { deckId: deck.id } })).toBe(0);
  });
});
