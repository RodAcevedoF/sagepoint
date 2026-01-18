import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { GetCategoriesUseCase } from '../../../app/usecases/get-categories.usecase';
import { CATEGORY_REPOSITORY, Category } from '@sagepoint/domain';
import type { ICategoryRepository } from '@sagepoint/domain';

// Simple DTO for now
export class CreateCategoryDto {
  name: string;
  slug: string;
}

@Controller('categories')
export class CategoryController {
  constructor(
    @Inject('GetCategoriesUseCase') private readonly getCategoriesUseCase: GetCategoriesUseCase,
    @Inject(CATEGORY_REPOSITORY) private readonly categoryConfigRepository: ICategoryRepository // Quick hack to create, ideally use CreateCategoryUseCase
  ) {}

  @Get()
  async findAll() {
    return this.getCategoriesUseCase.execute();
  }

  @Post()
  async create(@Body() body: CreateCategoryDto) {
      // Need ID generation if not passed, but Category entity has logic? 
      // Using quick entity creation for seed access
      const id = crypto.randomUUID();
      const cat = Category.create(id, body.name, body.slug);
      return this.categoryConfigRepository.save(cat);
  }
}
