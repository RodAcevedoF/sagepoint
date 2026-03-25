import { NotFoundException } from '@nestjs/common';
import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';

export class DeleteUserUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(id: string): Promise<{ success: true }> {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.adminRepository.deleteUser(id);
    return { success: true };
  }
}
