import { Module } from '@nestjs/common';
import { CategoryController } from './infra/driver/http/category.controller';
import { PrismaCategoryRepository } from './infra/adapter/prisma-category.repository';
import { GetCategoriesUseCase } from './app/usecases/get-categories.usecase';
import { CATEGORY_REPOSITORY } from '@sagepoint/domain';
import { PrismaService } from '@/core/infra/database/prisma.service';

@Module({
  controllers: [CategoryController],
  providers: [
    PrismaService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: PrismaCategoryRepository,
    },
    {
      provide: 'GetCategoriesUseCase',
      useFactory: (repo) => new GetCategoriesUseCase(repo),
      inject: [CATEGORY_REPOSITORY],
    },
  ],
  exports: [CATEGORY_REPOSITORY], // Export repository for other modules (User/Onboarding)
})
export class CategoryModule {}
