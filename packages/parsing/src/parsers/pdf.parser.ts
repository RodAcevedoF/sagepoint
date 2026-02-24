import { PDFParse } from 'pdf-parse';
import { DocumentParser, ParsedDocument } from '../interfaces/document-parser.interface';

export class PdfParser implements DocumentParser {
  async parse(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
    if (!this.supports(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    const pdf = new PDFParse({ data: new Uint8Array(buffer) });

    try {
      const textResult = await pdf.getText();
      const infoResult = await pdf.getInfo();

      return {
        text: textResult.text,
        metadata: {
          pageCount: infoResult.total,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          info: infoResult.info,
        },
      };
    } finally {
      await pdf.destroy();
    }
  }

  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }
}
