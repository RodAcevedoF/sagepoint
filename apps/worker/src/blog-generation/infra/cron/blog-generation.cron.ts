import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PickNextCategoryUseCase } from "../../app/usecases/pick-next-category.usecase";
import { GenerateBlogPostUseCase } from "../../app/usecases/generate-blog-post.usecase";

@Injectable()
export class BlogGenerationCron {
  private readonly logger = new Logger(BlogGenerationCron.name);

  constructor(
    private readonly pickNext: PickNextCategoryUseCase,
    private readonly generatePost: GenerateBlogPostUseCase,
  ) {}

  @Cron("0 7 */2 * *")
  async run() {
    this.logger.log("Starting blog generation...");
    const startedAt = Date.now();

    const category = await this.pickNext.execute();
    if (!category) {
      this.logger.warn("No categories available — skipping blog generation");
      return;
    }

    this.logger.log(`Selected category: ${category.name}`);

    try {
      const post = await this.generatePost.execute(category);
      if (post) {
        this.logger.log(
          `Blog post published: "${post.title}" (${post.slug}) — ${Date.now() - startedAt}ms`,
        );
      } else {
        this.logger.warn(
          `Skipped "${category.name}" — insufficient source articles`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate blog post for "${category.name}"`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
