import { Module } from '@nestjs/common';
import { REVIEW_SERVICE } from '@/features/review/domain/inbound/review.service';
import { ReviewController } from '@/features/review/infra/driver/http/review.controller';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [ReviewController],
  providers: [
    {
      provide: REVIEW_SERVICE,
      useFactory: () => getDependencies().review.reviewService,
    },
  ],
  exports: [REVIEW_SERVICE],
})
export class ReviewModule {}
