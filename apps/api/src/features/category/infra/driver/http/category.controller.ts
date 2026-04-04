import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORY_SERVICE,
  type ICategoryService,
} from '@/features/category/domain/inbound/category.service';
import { CreateCategoryDto } from './create-category.dto';
import { GetRoomDetailQueryDto } from './get-room-detail-query.dto';

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

  @Get('rooms')
  async getRooms() {
    return this.categoryService.getRooms();
  }

  @Get('rooms/:slug')
  async getRoomDetail(
    @Param('slug') slug: string,
    @Query() query: GetRoomDetailQueryDto,
  ) {
    const result = await this.categoryService.getRoomDetail(slug, query);
    if (!result) {
      throw new NotFoundException(`Category room "${slug}" not found`);
    }
    return result;
  }

  @Post()
  async create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }
}
