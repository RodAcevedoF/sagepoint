import { Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IFileStorage, UploadOptions } from '@sagepoint/domain';

export class SupabaseStorage implements IFileStorage {
  private readonly client: SupabaseClient;
  private readonly bucketName: string;
  private readonly logger = new Logger(SupabaseStorage.name);

  constructor(
    private readonly supabaseUrl: string,
    private readonly supabaseKey: string,
    bucketName: string,
  ) {
    this.bucketName = bucketName;
    this.client = createClient(supabaseUrl, supabaseKey);
    this.logger.log(`Initialized Supabase Storage with bucket: ${bucketName}`);
  }

  async upload(
    path: string,
    content: Buffer,
    mimeType: string,
    options?: UploadOptions,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucketName)
      .upload(path, content, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Failed to upload file to Supabase: ${error.message}`);
      throw error;
    }

    // If public, return the public URL
    if (options?.isPublic) {
      const { data: urlData } = this.client.storage
        .from(this.bucketName)
        .getPublicUrl(path);
      return urlData.publicUrl;
    }

    return data.path;
  }

  async download(path: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from(this.bucketName)
      .download(path);

    if (error) {
      this.logger.error(`Failed to download file from Supabase: ${error.message}`);
      throw error;
    }

    return Buffer.from(await data.arrayBuffer());
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      this.logger.error(`Failed to delete file from Supabase: ${error.message}`);
      throw error;
    }
  }

  async getUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    // Try to get a signed URL for private files
    const { data, error } = await this.client.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      this.logger.error(`Failed to get signed URL from Supabase: ${error.message}`);
      throw error;
    }

    return data.signedUrl;
  }
}
