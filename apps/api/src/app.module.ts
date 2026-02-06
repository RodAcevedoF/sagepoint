import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { RoadmapModule } from '@/features/roadmap/roadmap.module';
import { DocumentModule } from '@/features/document/document.module';
import { UserModule } from '@/features/user/user.module';
import { AuthModule } from '@/features/auth/auth.module';
import { StorageModule } from '@/features/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    RoadmapModule,
    DocumentModule,
    UserModule,
    AuthModule,
    StorageModule,
  ],
})
export class AppModule {}
