import { NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';

export class DeleteDocumentUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const exists = await this.adminRepository.documentExists(id);
    if (!exists) throw new NotFoundException('Document not found');

    await this.adminRepository.deleteDocument(id);
    return { success: true };
  }
}
