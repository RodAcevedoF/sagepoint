import { Storage, Bucket } from '@google-cloud/storage';
import type { IFileStorage, UploadOptions } from '@sagepoint/domain';

export interface GCSStorageConfig {
  projectId: string;
  bucketName: string;
  /** Path to service account key file, or leave undefined to use ADC */
  keyFilename?: string;
}

export class GCSStorage implements IFileStorage {
  private readonly storage: Storage;
  private readonly bucket: Bucket;
  private readonly bucketName: string;

  constructor(private readonly config: GCSStorageConfig) {
    this.bucketName = config.bucketName;

    this.storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });

    this.bucket = this.storage.bucket(config.bucketName);
  }

  async upload(
    path: string,
    content: Buffer,
    mimeType: string,
    options?: UploadOptions,
  ): Promise<string> {
    const file = this.bucket.file(path);

    await file.save(content, {
      contentType: mimeType,
      metadata: {
        metadata: options?.metadata,
      },
      public: options?.isPublic ?? false,
    });

    if (options?.isPublic) {
      return `https://storage.googleapis.com/${this.bucketName}/${path}`;
    }

    return path;
  }

  async download(path: string): Promise<Buffer> {
    const file = this.bucket.file(path);
    const [content] = await file.download();
    return content;
  }

  async delete(path: string): Promise<void> {
    const file = this.bucket.file(path);
    await file.delete();
  }

  async getUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const file = this.bucket.file(path);

    const [metadata] = await file.getMetadata();

    // If the file has public access, return direct URL
    if (metadata.acl?.some((entry: any) => entry.entity === 'allUsers')) {
      return `https://storage.googleapis.com/${this.bucketName}/${path}`;
    }

    // Otherwise, generate a signed URL
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    });

    return signedUrl;
  }
}
