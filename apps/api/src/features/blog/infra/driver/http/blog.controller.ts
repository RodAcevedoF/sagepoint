import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import type { PaginatedResult } from '@sagepoint/domain';
import {
  BLOG_SERVICE,
  type IBlogService,
} from '../../../domain/inbound/blog.service';
import { type BlogPostDto, toBlogPostDto } from './dto/blog-post.dto';
import { ListBlogPostsQueryDto } from './dto/list-blog-posts-query.dto';

@Controller('blog')
export class BlogController {
  constructor(
    @Inject(BLOG_SERVICE)
    private readonly blogService: IBlogService,
  ) {}

  @Get()
  async listPublished(
    @Query() query: ListBlogPostsQueryDto,
  ): Promise<PaginatedResult<BlogPostDto>> {
    const result = await this.blogService.listPublished({
      page: query.page,
      limit: query.limit,
    });
    return {
      data: result.data.map(toBlogPostDto),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.blogService.getBySlug(slug);
    if (!post) throw new NotFoundException(`Blog post not found: ${slug}`);
    return toBlogPostDto(post);
  }
}
