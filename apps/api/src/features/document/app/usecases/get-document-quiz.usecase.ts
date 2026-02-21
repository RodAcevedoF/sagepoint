import type { Quiz, IQuizRepository } from '@sagepoint/domain';

export class GetDocumentQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(documentId: string): Promise<Quiz[]> {
    return await this.quizRepository.findByDocumentId(documentId);
  }
}
