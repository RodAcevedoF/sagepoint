import type {
  Document,
  IDocumentRepository,
  CursorPaginationParams,
  CursorPaginatedResult,
} from '@sagepoint/domain';

export class GetUserDocumentsUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(userId: string): Promise<Document[]> {
    return await this.documentRepository.findByUserId(userId);
  }

  async executeCursor(
    userId: string,
    params: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<Document>> {
    return await this.documentRepository.findByUserIdCursor(userId, params);
  }
}
