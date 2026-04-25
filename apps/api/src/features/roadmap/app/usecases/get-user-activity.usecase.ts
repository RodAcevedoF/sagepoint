import {
  IProgressRepository,
  IUserRepository,
  ICacheService,
  ActivitySummary,
} from '@sagepoint/domain';

export type { ActivitySummary };

const MAX_DAYS = 365;
const CACHE_TTL = 300; // 5 min

export class GetUserActivityUseCase {
  constructor(
    private readonly progressRepository: IProgressRepository,
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(userId: string, days = 90): Promise<ActivitySummary> {
    const cappedDays = Math.min(days, MAX_DAYS);
    const cacheKey = `activity:${userId}:${cappedDays}`;

    const cached = await this.cacheService.get<ActivitySummary>(cacheKey);
    if (cached) return cached;

    const user = await this.userRepository.findById(userId);
    const timezone = user?.timezone ?? 'UTC';

    const summary = await this.progressRepository.getActivitySummary(
      userId,
      cappedDays,
      timezone,
    );

    await this.cacheService.set(cacheKey, summary, CACHE_TTL);
    return summary;
  }
}
