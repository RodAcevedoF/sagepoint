import * as XLSX from 'xlsx';
import { DocumentParser, ParsedDocument } from '../interfaces/document-parser.interface';

export class XlsxParser implements DocumentParser {
  parse(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
    if (!this.supports(mimeType)) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const lines: string[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      lines.push(`--- Sheet: ${sheetName} ---`);
      lines.push(csv);
    }

    return Promise.resolve({
      text: lines.join('\n'),
      metadata: {
        sheetCount: workbook.SheetNames.length,
        sheetNames: workbook.SheetNames,
      },
    });
  }

  supports(mimeType: string): boolean {
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    );
  }
}
