import type { IBlogPostRepository, ICacheService } from '@sagepoint/domain';
import type { PrismaClient } from '@sagepoint/database';
import { PrismaBlogPostRepository } from '@sagepoint/database';
import { ListPublishedPostsUseCase } from './app/usecases/list-published-posts.usecase';
import { GetPostBySlugUseCase } from './app/usecases/get-post-by-slug.usecase';
import { BlogService } from './infra/driver/blog.service';

export interface BlogDependencies {
  blogPostRepository: IBlogPostRepository;
  blogService: BlogService;
}

export function makeBlogDependencies(
  prisma: PrismaClient,
  cache: ICacheService,
): BlogDependencies {
  const blogPostRepository = new PrismaBlogPostRepository(prisma);
  const listPublished = new ListPublishedPostsUseCase(
    blogPostRepository,
    cache,
  );
  const getBySlug = new GetPostBySlugUseCase(blogPostRepository, cache);
  const blogService = new BlogService(listPublished, getBySlug);

  return { blogPostRepository, blogService };
}
