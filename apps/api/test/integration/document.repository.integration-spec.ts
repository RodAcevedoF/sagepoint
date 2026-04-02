import {
  connectPrisma,
  disconnectPrisma,
  cleanDatabase,
  asPrismaService,
  getPrismaClient,
} from './_setup/prisma-test-client';
import {
  PrismaDocumentRepository,
  PrismaDocumentSummaryRepository,
  PrismaQuizRepository,
  PrismaQuestionRepository,
  PrismaQuizAttemptRepository,
} from '@sagepoint/database';
import {
  Document,
  DocumentStatus,
  ProcessingStage,
  DocumentSummary,
  Quiz,
  Question,
  QuestionType,
  QuizAttempt,
} from '@sagepoint/domain';

describe('Document repositories (integration)', () => {
  let docRepo: PrismaDocumentRepository;
  let summaryRepo: PrismaDocumentSummaryRepository;
  let quizRepo: PrismaQuizRepository;
  let questionRepo: PrismaQuestionRepository;
  let attemptRepo: PrismaQuizAttemptRepository;

  const NOW = new Date('2026-01-01');
  const USER_ID = '00000000-0000-0000-0000-0000000a0001';

  async function seedUser() {
    await getPrismaClient().user.create({
      data: {
        id: USER_ID,
        email: 'test@test.com',
        name: 'Test',
        password: 'x',
      },
    });
  }

  function buildDoc(
    overrides: Partial<{
      id: string;
      filename: string;
      status: DocumentStatus;
      stage: ProcessingStage;
    }> = {},
  ) {
    return new Document(
      overrides.id ?? '00000000-0000-0000-0000-00000000d001',
      overrides.filename ?? 'thesis.pdf',
      'docs/thesis.pdf',
      overrides.status ?? DocumentStatus.COMPLETED,
      USER_ID,
      NOW,
      NOW,
      undefined,
      0,
      overrides.stage ?? ProcessingStage.READY,
      'application/pdf',
      1024,
      5,
    );
  }

  beforeAll(async () => {
    await connectPrisma();
    const prisma = asPrismaService();
    docRepo = new PrismaDocumentRepository(prisma);
    summaryRepo = new PrismaDocumentSummaryRepository(prisma);
    quizRepo = new PrismaQuizRepository(prisma);
    questionRepo = new PrismaQuestionRepository(prisma);
    attemptRepo = new PrismaQuizAttemptRepository(prisma);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
    await seedUser();
  });

  // ─── Document ──────────────────────────────────────────────────────────────

  describe('PrismaDocumentRepository', () => {
    describe('save + findById', () => {
      it('creates and retrieves a document', async () => {
        await docRepo.save(buildDoc());

        const found = await docRepo.findById(
          '00000000-0000-0000-0000-00000000d001',
        );
        expect(found).not.toBeNull();
        expect(found!.filename).toBe('thesis.pdf');
        expect(found!.mimeType).toBe('application/pdf');
        expect(found!.processingStage).toBe(ProcessingStage.READY);
      });

      it('updates an existing document', async () => {
        await docRepo.save(buildDoc({ status: DocumentStatus.PROCESSING }));
        await docRepo.save(buildDoc({ status: DocumentStatus.COMPLETED }));

        const found = await docRepo.findById(
          '00000000-0000-0000-0000-00000000d001',
        );
        expect(found!.status).toBe(DocumentStatus.COMPLETED);
      });
    });

    describe('findByUserId', () => {
      it('returns documents for a user ordered by createdAt desc', async () => {
        await docRepo.save(
          buildDoc({
            id: '00000000-0000-0000-0000-00000000d001',
            filename: 'first.pdf',
          }),
        );
        await docRepo.save(
          buildDoc({
            id: '00000000-0000-0000-0000-00000000d002',
            filename: 'second.pdf',
          }),
        );

        const docs = await docRepo.findByUserId(USER_ID);
        expect(docs).toHaveLength(2);
      });

      it('returns empty for user with no documents', async () => {
        const docs = await docRepo.findByUserId(
          '00000000-0000-0000-0000-ffffffffffff',
        );
        expect(docs).toEqual([]);
      });
    });

    describe('findByUserIdCursor', () => {
      it('paginates with cursor', async () => {
        // Create 3 documents with different timestamps
        for (let i = 1; i <= 3; i++) {
          const doc = new Document(
            `00000000-0000-0000-0000-00000000d0${String(i).padStart(2, '0')}`,
            `file-${i}.pdf`,
            `docs/${i}`,
            DocumentStatus.COMPLETED,
            USER_ID,
            new Date(`2026-01-0${i}`),
            new Date(`2026-01-0${i}`),
            undefined,
            0,
            ProcessingStage.READY,
          );
          await docRepo.save(doc);
        }

        // First page: limit=2
        const page1 = await docRepo.findByUserIdCursor(USER_ID, { limit: 2 });
        expect(page1.data).toHaveLength(2);
        expect(page1.hasMore).toBe(true);
        expect(page1.total).toBe(3);
        expect(page1.nextCursor).not.toBeNull();

        // Second page using cursor
        const page2 = await docRepo.findByUserIdCursor(USER_ID, {
          limit: 2,
          cursor: page1.nextCursor!,
        });
        expect(page2.data).toHaveLength(1);
        expect(page2.hasMore).toBe(false);
      });
    });

    describe('delete', () => {
      it('removes a document', async () => {
        await docRepo.save(buildDoc());
        await docRepo.delete('00000000-0000-0000-0000-00000000d001');

        const found = await docRepo.findById(
          '00000000-0000-0000-0000-00000000d001',
        );
        expect(found).toBeNull();
      });
    });
  });

  // ─── DocumentSummary ───────────────────────────────────────────────────────

  describe('PrismaDocumentSummaryRepository', () => {
    it('saves and retrieves a summary by documentId', async () => {
      await docRepo.save(buildDoc());

      const summary = new DocumentSummary(
        '00000000-0000-0000-0000-000000005001',
        '00000000-0000-0000-0000-00000000d001',
        'An overview of the thesis.',
        ['Point A', 'Point B'],
        'Computer Science',
        'intermediate',
        5,
        NOW,
        10,
      );
      await summaryRepo.save(summary);

      const found = await summaryRepo.findByDocumentId(
        '00000000-0000-0000-0000-00000000d001',
      );
      expect(found).not.toBeNull();
      expect(found!.overview).toBe('An overview of the thesis.');
      expect(found!.keyPoints).toEqual(['Point A', 'Point B']);
      expect(found!.topicArea).toBe('Computer Science');
    });

    it('updates summary on second save (same documentId)', async () => {
      await docRepo.save(buildDoc());

      await summaryRepo.save(
        new DocumentSummary(
          '00000000-0000-0000-0000-000000005001',
          '00000000-0000-0000-0000-00000000d001',
          'V1',
          ['A'],
          'CS',
          'beginner',
          0,
          NOW,
        ),
      );
      await summaryRepo.save(
        new DocumentSummary(
          '00000000-0000-0000-0000-000000005001',
          '00000000-0000-0000-0000-00000000d001',
          'V2',
          ['B'],
          'ML',
          'advanced',
          3,
          NOW,
        ),
      );

      const found = await summaryRepo.findByDocumentId(
        '00000000-0000-0000-0000-00000000d001',
      );
      expect(found!.overview).toBe('V2');
      expect(found!.topicArea).toBe('ML');
    });

    it('deletes summary by documentId', async () => {
      await docRepo.save(buildDoc());
      await summaryRepo.save(
        new DocumentSummary(
          '00000000-0000-0000-0000-000000005001',
          '00000000-0000-0000-0000-00000000d001',
          'X',
          [],
          'Y',
          'beginner',
          0,
          NOW,
        ),
      );

      await summaryRepo.deleteByDocumentId(
        '00000000-0000-0000-0000-00000000d001',
      );

      const found = await summaryRepo.findByDocumentId(
        '00000000-0000-0000-0000-00000000d001',
      );
      expect(found).toBeNull();
    });
  });

  // ─── Quiz + Questions ──────────────────────────────────────────────────────

  describe('PrismaQuizRepository + PrismaQuestionRepository', () => {
    it('saves quiz with questions and retrieves them', async () => {
      await docRepo.save(buildDoc());

      const quiz = new Quiz(
        '00000000-0000-0000-0000-000000009001',
        '00000000-0000-0000-0000-00000000d001',
        'Chapter 1 Quiz',
        2,
        NOW,
        NOW,
      );
      await quizRepo.save(quiz);

      const q1 = new Question(
        '00000000-0000-0000-0000-000000009101',
        '00000000-0000-0000-0000-000000009001',
        QuestionType.MULTIPLE_CHOICE,
        'What is React?',
        [
          { label: 'A', text: 'A library', isCorrect: true },
          { label: 'B', text: 'A language', isCorrect: false },
        ],
        1,
        'intermediate',
        NOW,
        'React is a UI library.',
      );
      const q2 = new Question(
        '00000000-0000-0000-0000-000000009102',
        '00000000-0000-0000-0000-000000009001',
        QuestionType.TRUE_FALSE,
        'React uses a virtual DOM.',
        [
          { label: 'True', text: 'True', isCorrect: true },
          { label: 'False', text: 'False', isCorrect: false },
        ],
        2,
        'beginner',
        NOW,
      );
      await questionRepo.saveMany([q1, q2]);

      const questions = await questionRepo.findByQuizId(
        '00000000-0000-0000-0000-000000009001',
      );
      expect(questions).toHaveLength(2);
      expect(questions[0].order).toBe(1);
      expect(questions[1].order).toBe(2);
      expect(questions[0].options).toHaveLength(2);
      expect(questions[0].options[0].isCorrect).toBe(true);
    });

    it('deletes questions by quizId', async () => {
      await docRepo.save(buildDoc());
      await quizRepo.save(
        new Quiz(
          '00000000-0000-0000-0000-000000009001',
          '00000000-0000-0000-0000-00000000d001',
          'Q',
          1,
          NOW,
          NOW,
        ),
      );
      await questionRepo.saveMany([
        new Question(
          '00000000-0000-0000-0000-000000009101',
          '00000000-0000-0000-0000-000000009001',
          QuestionType.TRUE_FALSE,
          'T?',
          [
            { label: 'True', text: 'True', isCorrect: true },
            { label: 'False', text: 'False', isCorrect: false },
          ],
          1,
          'beginner',
          NOW,
        ),
      ]);

      await questionRepo.deleteByQuizId('00000000-0000-0000-0000-000000009001');

      const questions = await questionRepo.findByQuizId(
        '00000000-0000-0000-0000-000000009001',
      );
      expect(questions).toEqual([]);
    });
  });

  // ─── QuizAttempt ───────────────────────────────────────────────────────────

  describe('PrismaQuizAttemptRepository', () => {
    it('saves and retrieves attempts by user+quiz', async () => {
      await docRepo.save(buildDoc());
      await quizRepo.save(
        new Quiz(
          '00000000-0000-0000-0000-000000009001',
          '00000000-0000-0000-0000-00000000d001',
          'Q',
          2,
          NOW,
          NOW,
        ),
      );

      const attempt = new QuizAttempt(
        '00000000-0000-0000-0000-00000000a101',
        '00000000-0000-0000-0000-000000009001',
        USER_ID,
        {
          '00000000-0000-0000-0000-000000009101': 'A',
          '00000000-0000-0000-0000-000000009102': 'True',
        },
        0.75,
        2,
        1,
        NOW,
        NOW,
      );
      await attemptRepo.save(attempt);

      const found = await attemptRepo.findByUserAndQuiz(
        USER_ID,
        '00000000-0000-0000-0000-000000009001',
      );
      expect(found).toHaveLength(1);
      expect(found[0].score).toBe(0.75);
      expect(found[0].answers).toEqual({
        '00000000-0000-0000-0000-000000009101': 'A',
        '00000000-0000-0000-0000-000000009102': 'True',
      });
    });

    it('returns attempts ordered by createdAt desc', async () => {
      await docRepo.save(buildDoc());
      await quizRepo.save(
        new Quiz(
          '00000000-0000-0000-0000-000000009001',
          '00000000-0000-0000-0000-00000000d001',
          'Q',
          1,
          NOW,
          NOW,
        ),
      );

      await attemptRepo.save(
        new QuizAttempt(
          '00000000-0000-0000-0000-00000000a101',
          '00000000-0000-0000-0000-000000009001',
          USER_ID,
          {},
          0.5,
          1,
          0,
          new Date('2026-01-01'),
          new Date('2026-01-01'),
        ),
      );
      await attemptRepo.save(
        new QuizAttempt(
          '00000000-0000-0000-0000-00000000a102',
          '00000000-0000-0000-0000-000000009001',
          USER_ID,
          {},
          1.0,
          1,
          1,
          new Date('2026-01-02'),
          new Date('2026-01-02'),
        ),
      );

      const found = await attemptRepo.findByUserAndQuiz(
        USER_ID,
        '00000000-0000-0000-0000-000000009001',
      );
      expect(found[0].id).toBe('00000000-0000-0000-0000-00000000a102'); // newer first
    });
  });
});
