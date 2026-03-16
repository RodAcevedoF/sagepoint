import { Module } from '@nestjs/common';
import { CATEGORY_SERVICE } from '@/features/category/domain/inbound/category.service';
import { CATEGORY_REPOSITORY } from '@sagepoint/domain';
import { CategoryController } from './infra/driver/http/category.controller';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [CategoryController],
  providers: [
    {
      provide: CATEGORY_SERVICE,
      useFactory: () => getDependencies().category.categoryService,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useFactory: () => getDependencies().category.categoryRepository,
    },
  ],
  exports: [CATEGORY_SERVICE, CATEGORY_REPOSITORY],
})
export class CategoryModule {}
