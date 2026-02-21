import mammoth from 'mammoth';
import { DocumentParser, ParsedDocument } from '../interfaces/document-parser.interface';

export class DocxParser implements DocumentParser {
  async parse(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
    if (!this.supports(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      metadata: {
        warnings: result.messages.map((m) => m.message),
      },
    };
  }

  supports(mimeType: string): boolean {
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    );
  }
}
