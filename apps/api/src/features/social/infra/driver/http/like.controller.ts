import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  LIKE_SERVICE,
  type ILikeService,
} from '@/features/social/domain/inbound/like.service';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';

@Controller('likes')
export class LikeController {
  constructor(
    @Inject(LIKE_SERVICE)
    private readonly likeService: ILikeService,
  ) {}

  @Post('roadmaps/:roadmapId')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('roadmapId') roadmapId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.likeService.toggleLike(user.id, roadmapId);
  }

  @Get('roadmaps/:roadmapId/status')
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(
    @Param('roadmapId') roadmapId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.likeService.getLikeStatus(user.id, roadmapId);
  }

  @Get('roadmaps/counts')
  async getLikeCountsBatch(@Query('ids') ids: string) {
    const roadmapIds = ids ? ids.split(',').filter(Boolean) : [];
    return this.likeService.getLikeCountsBatch(roadmapIds);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getLikedRoadmaps(@CurrentUser() user: RequestUser) {
    return this.likeService.getLikedRoadmaps(user.id);
  }
}
