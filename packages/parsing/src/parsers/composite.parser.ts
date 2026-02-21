import { DocumentParser, ParsedDocument } from '../interfaces/document-parser.interface';
import { PdfParser } from './pdf.parser';
import { DocxParser } from './docx.parser';
import { XlsxParser } from './xlsx.parser';

export class CompositeDocumentParser implements DocumentParser {
  private readonly parsers: DocumentParser[];

  constructor() {
    this.parsers = [new PdfParser(), new DocxParser(), new XlsxParser()];
  }

  async parse(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
    const parser = this.parsers.find((p) => p.supports(mimeType));
    if (!parser) {
      throw new Error(`No parser found for MIME type: ${mimeType}`);
    }
    return parser.parse(buffer, mimeType);
  }

  supports(mimeType: string): boolean {
    return this.parsers.some((p) => p.supports(mimeType));
  }
}
