import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from '@sagepoint/database';
import type { ICacheService, INewsService } from '@sagepoint/domain';
import { NEWS_SERVICE } from '@sagepoint/domain';

const NEWS_CACHE_TTL = 43200; // 12 hours

@Injectable()
export class InsightsRefreshService {
	private readonly logger = new Logger(InsightsRefreshService.name);
	private readonly prisma = new PrismaClient();

	constructor(
		@Inject('WORKER_CACHE') private readonly cache: ICacheService,
		@Inject(NEWS_SERVICE) private readonly newsService: INewsService,
	) {}

	@Cron('0 */12 * * *')
	async refreshNewsCache() {
		this.logger.log('Starting news cache refresh...');

		const categories = await this.prisma.category.findMany();

		for (const category of categories) {
			try {
				const articles = await this.newsService.fetchByCategory(
					category.slug,
					category.name,
				);

				if (articles.length > 0) {
					await this.cache.set(
						`news:${category.slug}`,
						articles,
						NEWS_CACHE_TTL,
					);
				}

				this.logger.log(
					`Refreshed ${articles.length} articles for ${category.name}`,
				);
			} catch (error) {
				this.logger.error(
					`Failed to refresh news for ${category.name}`,
					error instanceof Error ? error.stack : undefined,
				);
			}
		}

		this.logger.log('News cache refresh complete');
	}
}
