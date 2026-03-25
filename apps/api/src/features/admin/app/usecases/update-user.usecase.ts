import { NotFoundException } from '@nestjs/common';
import type {
  IAdminRepository,
  AdminUserView,
} from '../../domain/outbound/admin.repository.port';

export class UpdateUserUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(
    id: string,
    data: { role?: string; isActive?: boolean },
  ): Promise<AdminUserView> {
    const user = await this.adminRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');

    return this.adminRepository.updateUser(id, data);
  }
}
