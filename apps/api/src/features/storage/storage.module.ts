import { Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './domain/inbound/storage.service';
import { StorageController } from './infra/driver/http/storage.controller';
import { getDependencies } from '@/core/bootstrap';

@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: () => getDependencies().storage.storageService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
