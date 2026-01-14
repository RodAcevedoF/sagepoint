export interface IFileStorage {
  /**
   * Uploads a file to the storage.
   * @param path The path/key where the file should be stored.
   * @param content The file content as a buffer.
   * @param mimeType The MIME type of the file.
   * @returns The storage path or identifier (could be a URL or internal path).
   */
  upload(path: string, content: Buffer, mimeType: string): Promise<string>;

  /**
   * Retrieves a file from storage.
   * @param path The path/key of the file.
   * @returns The file content as a buffer.
   */
  download(path: string): Promise<Buffer>
  /**
   * Deletes a file from storage.
   * @param path The path/key of the file.
   */
  delete(path: string): Promise<void>;
}
