import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_SERVICE,
  type IUserService,
} from '@/features/user/domain/inbound/user.service';

interface CreateUserDto {
  email: string;
  name: string;
}

@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const user = await this.userService.get(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
