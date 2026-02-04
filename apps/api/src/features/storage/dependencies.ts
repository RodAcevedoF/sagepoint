import { IFileStorage } from '@sagepoint/domain';
import { StorageService } from './infra/driver/storage.service';
import { IStorageService } from './domain/inbound/storage.service';

export interface StorageDependencies {
  storageService: IStorageService;
}

export function makeStorageDependencies(
  fileStorage: IFileStorage,
): StorageDependencies {
  const storageService = new StorageService(fileStorage);

  return {
    storageService,
  };
}
