import { Storage, Bucket } from "@google-cloud/storage";
import type { IFileStorage, UploadOptions } from "@sagepoint/domain";

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
      // Do NOT set `public: true` — bucket uses uniform bucket-level access.
      // Public access is controlled by the bucket IAM policy, not per-object ACLs.
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

    // With uniform bucket-level access, check if the bucket is publicly readable.
    // If so, return the direct public URL; otherwise, generate a signed URL.
    try {
      const [policy] = await this.bucket.iam.getPolicy();
      const isPublicBucket = policy.bindings?.some(
        (b) =>
          b.role === "roles/storage.objectViewer" &&
          b.members?.includes("allUsers"),
      );
      if (isPublicBucket) {
        return `https://storage.googleapis.com/${this.bucketName}/${path}`;
      }
    } catch {
      // Fall through to signed URL if policy check fails
    }

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresInSeconds * 1000,
    });

    return signedUrl;
  }
}
