import { Module } from '@nestjs/common';
import { BlogController } from './infra/driver/http/blog.controller';
import { BLOG_SERVICE } from './domain/inbound/blog.service';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [BlogController],
  providers: [
    {
      provide: BLOG_SERVICE,
      useFactory: () => getDependencies().blog.blogService,
    },
  ],
})
export class BlogModule {}
