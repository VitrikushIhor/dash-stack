import { toSingleChoiceScoring } from '../../../application/projections/to-single-choice-scoring';
import { parseSingleChoiceAnswer } from '../../../application/validation/single-choice-answer.schema';
import { parseSingleChoiceDraft } from '../../../application/validation/single-choice-draft.schema';
import { QUESTION_TYPE } from '../../../domain/enums/question-type';
import { publishSingleChoiceContent } from '../../../domain/questions/publish-single-choice-content';
import { SingleChoiceEvaluator } from '../../../domain/questions/single-choice-evaluator';
import { calculateTestScore } from '../../../domain/scoring/calculate-test-score';

function document(text: string) {
  return {
    schemaVersion: 1,
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

function draftPayload(questionId: string): unknown {
  return {
    questionId,
    kind: QUESTION_TYPE.SINGLE_CHOICE,
    prompt: document('Choose the future form.'),
    options: [
      { optionId: 'a', label: document('will') },
      { optionId: 'b', label: document('went') },
    ],
    solution: { correctOptionId: 'a' },
    explanation: document('Use will for predictions.'),
  };
}

describe('Single-choice content and scoring flow', () => {
  it.each([
    {
      scenario: 'the_third_answer_is_wrong',
      thirdAnswer: {
        questionId: 'q3',
        kind: QUESTION_TYPE.SINGLE_CHOICE,
        selectedOptionId: 'b',
      },
    },
    { scenario: 'the_third_question_is_omitted', thirdAnswer: undefined },
  ])('should_return_two_of_three_points_when_$scenario', ({ thirdAnswer }) => {
    const publishedQuestions = ['q1', 'q2', 'q3'].map((questionId) =>
      publishSingleChoiceContent(parseSingleChoiceDraft(draftPayload(questionId))),
    );
    const answerPayloads: readonly unknown[] = [
      { questionId: 'q1', kind: QUESTION_TYPE.SINGLE_CHOICE, selectedOptionId: 'a' },
      { questionId: 'q2', kind: QUESTION_TYPE.SINGLE_CHOICE, selectedOptionId: 'a' },
      thirdAnswer,
    ];
    const evaluator = new SingleChoiceEvaluator();

    const questionResults = publishedQuestions.map((question, index) => {
      const payload = answerPayloads[index];
      const answer = payload === undefined ? undefined : parseSingleChoiceAnswer(payload);
      return evaluator.evaluate(toSingleChoiceScoring(question), answer);
    });
    const score = calculateTestScore(questionResults);

    expect(questionResults.map((result) => result.earnedPoints)).toEqual([1, 1, 0]);
    expect(questionResults[2]).toEqual({
      questionId: 'q3',
      kind: QUESTION_TYPE.SINGLE_CHOICE,
      selectedOptionId: thirdAnswer === undefined ? null : 'b',
      correctOptionId: 'a',
      isCorrect: false,
      earnedPoints: 0,
      maxPoints: 1,
    });
    expect(score).toEqual({ earnedPoints: 2, maxPoints: 3, percentage: 67 });
  });
});
