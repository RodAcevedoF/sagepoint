import type {
  DocumentSummary,
  IDocumentSummaryRepository,
} from '@sagepoint/domain';

export class GetDocumentSummaryUseCase {
  constructor(private readonly summaryRepository: IDocumentSummaryRepository) {}

  async execute(documentId: string): Promise<DocumentSummary | null> {
    return await this.summaryRepository.findByDocumentId(documentId);
  }
}
