export interface ParsedDocument {
  text: string;
  metadata: Record<string, any>;
  chunks?: string[];
}

export interface DocumentParser {
  parse(buffer: Buffer, mimeType: string): Promise<ParsedDocument>;
  supports(mimeType: string): boolean;
}
