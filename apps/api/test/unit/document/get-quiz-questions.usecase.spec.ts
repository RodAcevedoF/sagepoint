import { GetQuizQuestionsUseCase } from '../../../src/features/document/app/usecases/get-quiz-questions.usecase';
import { Quiz, Question, QuestionType } from '@sagepoint/domain';
import { NotFoundException } from '@nestjs/common';
import {
  FakeQuizRepository,
  FakeQuestionRepository,
} from '../_fakes/repositories';

const FIXED_DATE = new Date('2026-01-01');

describe('GetQuizQuestionsUseCase', () => {
  let quizRepo: FakeQuizRepository;
  let questionRepo: FakeQuestionRepository;
  let useCase: GetQuizQuestionsUseCase;

  beforeEach(() => {
    quizRepo = new FakeQuizRepository();
    questionRepo = new FakeQuestionRepository();
    useCase = new GetQuizQuestionsUseCase(quizRepo, questionRepo);
  });

  describe('when the quiz exists', () => {
    it('returns quiz with its questions', async () => {
      quizRepo.seed(
        new Quiz('q1', 'doc1', 'Test Quiz', 2, FIXED_DATE, FIXED_DATE),
      );
      questionRepo.seed(
        new Question(
          'qn1',
          'q1',
          QuestionType.MULTIPLE_CHOICE,
          'Q1?',
          [
            { label: 'A', text: 'Yes', isCorrect: true },
            { label: 'B', text: 'No', isCorrect: false },
          ],
          1,
          'easy',
          FIXED_DATE,
        ),
        new Question(
          'qn2',
          'q1',
          QuestionType.TRUE_FALSE,
          'Q2?',
          [
            { label: 'True', text: 'True', isCorrect: true },
            { label: 'False', text: 'False', isCorrect: false },
          ],
          2,
          'easy',
          FIXED_DATE,
        ),
      );

      const result = await useCase.execute('q1');

      expect(result.quiz.title).toBe('Test Quiz');
      expect(result.questions).toHaveLength(2);
    });
  });

  describe('when the quiz does not exist', () => {
    it('throws NotFoundException', async () => {
      await expect(useCase.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
