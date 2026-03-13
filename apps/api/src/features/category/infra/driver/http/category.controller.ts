import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import {
  CATEGORY_SERVICE,
  type ICategoryService,
} from '@/features/category/domain/inbound/category.service';
import { CreateCategoryDto } from './create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(
    @Inject(CATEGORY_SERVICE)
    private readonly categoryService: ICategoryService,
  ) {}

  @Get()
  async findAll() {
    return this.categoryService.getAll();
  }

  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }
}
