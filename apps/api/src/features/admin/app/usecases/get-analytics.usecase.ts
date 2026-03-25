import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';
import type { AnalyticsResult } from '../../domain/inbound/admin.service.port';

export class GetAnalyticsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(days: number): Promise<AnalyticsResult> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [signups, uploads, generations] = await Promise.all([
      this.adminRepository.getSignupsByDay(since),
      this.adminRepository.getUploadsByDay(since),
      this.adminRepository.getGenerationsByDay(since),
    ]);

    return { signups, uploads, generations };
  }
}
