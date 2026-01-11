import { DocumentParser, ParsedDocument } from '../interfaces/document-parser.interface';

export class PdfParser implements DocumentParser {
  async parse(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
    if (!this.supports(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    // TODO: Implement actual PDF parsing (e.g., using pdf-parse or similar)
    return {
      text: "Simulated PDF content extraction...",
      metadata: {
        pageCount: 1,
        author: "Unknown"
      }
    };
  }

  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }
}
