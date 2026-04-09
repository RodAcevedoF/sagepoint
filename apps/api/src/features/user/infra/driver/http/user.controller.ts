import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  USER_SERVICE,
  type IUserService,
} from '@/features/user/domain/inbound/user.service';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { UpdateProfileDto } from '@/features/user/app/dto/update-profile.dto';
import {
  USER_DTO_MAPPER,
  type IUserDtoMapper,
} from '@/features/user/app/dto/user-dto.mapper';

interface CreateUserDto {
  email: string;
  name: string;
}

@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(USER_DTO_MAPPER)
    private readonly mapper: IUserDtoMapper,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Get('me/quota')
  @UseGuards(JwtAuthGuard)
  async getQuota(@CurrentUser() reqUser: RequestUser) {
    return this.userService.getQuota(reqUser.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() reqUser: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.userService.updateProfile(reqUser.id, dto);
    return this.mapper.toDto(user);
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
