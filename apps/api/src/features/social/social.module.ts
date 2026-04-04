import { Module } from '@nestjs/common';
import { LIKE_SERVICE } from '@/features/social/domain/inbound/like.service';
import { LikeController } from '@/features/social/infra/driver/http/like.controller';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [LikeController],
  providers: [
    {
      provide: LIKE_SERVICE,
      useFactory: () => getDependencies().social.likeService,
    },
  ],
  exports: [LIKE_SERVICE],
})
export class SocialModule {}
