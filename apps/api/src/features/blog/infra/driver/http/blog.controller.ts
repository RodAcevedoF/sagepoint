import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  BLOG_SERVICE,
  type IBlogService,
} from '../../../domain/inbound/blog.service';
import { toBlogPostDto } from './dto/blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(
    @Inject(BLOG_SERVICE)
    private readonly blogService: IBlogService,
  ) {}

  @Get()
  async listPublished(@Query('limit') limit?: string) {
    const posts = await this.blogService.listPublished(
      limit ? parseInt(limit, 10) : 10,
    );
    return posts.map(toBlogPostDto);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.blogService.getBySlug(slug);
    if (!post) throw new NotFoundException(`Blog post not found: ${slug}`);
    return toBlogPostDto(post);
  }
}
