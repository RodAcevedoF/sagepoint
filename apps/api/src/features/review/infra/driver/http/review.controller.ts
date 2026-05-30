import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  REVIEW_SERVICE,
  type IReviewService,
} from '@/features/review/domain/inbound/review.service';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { CountDueQueryDto, GetDueQueryDto } from './get-due-query.dto';
import { GradeReviewDto } from './grade-review.dto';

@Controller('review')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
  ) {}

  @Get('due')
  getDue(@CurrentUser() user: RequestUser, @Query() query: GetDueQueryDto) {
    return this.reviewService.getDueQueue(user.id, query);
  }

  @Get('due/count')
  countDue(@CurrentUser() user: RequestUser, @Query() query: CountDueQueryDto) {
    return this.reviewService.countDue(user.id, query);
  }

  @Post('cards/:id/grade')
  grade(
    @CurrentUser() user: RequestUser,
    @Param('id') cardId: string,
    @Body() body: GradeReviewDto,
  ) {
    return this.reviewService.grade(user.id, cardId, body.quality);
  }
}
