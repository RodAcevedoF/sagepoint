import { IFileStorage } from '@sagepoint/domain';
import { UploadFileUseCase } from '../../app/usecases/upload-file.usecase';
import {
  IStorageService,
  UploadFileInput,
  UploadResult,
} from '../../domain/inbound/storage.service';

export class StorageService implements IStorageService {
  private readonly uploadFileUseCase: UploadFileUseCase;

  constructor(private readonly fileStorage: IFileStorage) {
    this.uploadFileUseCase = new UploadFileUseCase(fileStorage);
  }

  async upload(input: UploadFileInput): Promise<UploadResult> {
    return this.uploadFileUseCase.execute(input);
  }

  async getUrl(path: string, expiresInSeconds?: number): Promise<string> {
    return this.fileStorage.getUrl(path, expiresInSeconds);
  }

  async delete(path: string): Promise<void> {
    return this.fileStorage.delete(path);
  }

  async download(path: string): Promise<Buffer> {
    return this.fileStorage.download(path);
  }
}
