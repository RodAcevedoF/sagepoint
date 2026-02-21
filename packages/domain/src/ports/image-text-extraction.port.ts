export const IMAGE_TEXT_EXTRACTION_SERVICE = Symbol('IMAGE_TEXT_EXTRACTION_SERVICE');

export interface IImageTextExtractionService {
  extractText(imageBuffer: Buffer, mimeType: string): Promise<string>;
}
