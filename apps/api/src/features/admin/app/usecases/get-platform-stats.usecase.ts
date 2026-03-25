import type { IAdminRepository } from '../../domain/outbound/admin.repository.port';
import type { PlatformStats } from '../../domain/inbound/admin.service.port';

export class GetPlatformStatsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<PlatformStats> {
    const [
      userCount,
      documentCount,
      roadmapCount,
      quizCount,
      documentsByStage,
    ] = await Promise.all([
      this.adminRepository.countUsers(),
      this.adminRepository.countDocuments(),
      this.adminRepository.countRoadmaps(),
      this.adminRepository.countQuizzes(),
      this.adminRepository.getDocumentCountsByStage(),
    ]);

    return {
      userCount,
      documentCount,
      roadmapCount,
      quizCount,
      documentsByStage,
    };
  }
}
