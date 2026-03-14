import { CompositeDocumentParser } from "../../src/parsers/composite.parser";
import type { ParsedDocument } from "../../src/interfaces/document-parser.interface";

const mockPdfParse = jest.fn<Promise<ParsedDocument>, [Buffer, string]>();
const mockDocxParse = jest.fn<Promise<ParsedDocument>, [Buffer, string]>();
const mockXlsxParse = jest.fn<Promise<ParsedDocument>, [Buffer, string]>();

jest.mock("../../src/parsers/pdf.parser", () => ({
  PdfParser: jest.fn().mockImplementation(() => ({
    parse: mockPdfParse,
    supports: (mime: string) => mime === "application/pdf",
  })),
}));

jest.mock("../../src/parsers/docx.parser", () => ({
  DocxParser: jest.fn().mockImplementation(() => ({
    parse: mockDocxParse,
    supports: (mime: string) =>
      mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword",
  })),
}));

jest.mock("../../src/parsers/xlsx.parser", () => ({
  XlsxParser: jest.fn().mockImplementation(() => ({
    parse: mockXlsxParse,
    supports: (mime: string) =>
      mime ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mime === "application/vnd.ms-excel",
  })),
}));

describe("CompositeDocumentParser", () => {
  let parser: CompositeDocumentParser;
  const buffer = Buffer.from("data");

  const pdfResult: ParsedDocument = {
    text: "pdf text",
    metadata: { pageCount: 1 },
  };
  const docxResult: ParsedDocument = {
    text: "docx text",
    metadata: { warnings: [] },
  };
  const xlsxResult: ParsedDocument = {
    text: "xlsx text",
    metadata: { sheetCount: 1 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    parser = new CompositeDocumentParser();

    mockPdfParse.mockResolvedValue(pdfResult);
    mockDocxParse.mockResolvedValue(docxResult);
    mockXlsxParse.mockResolvedValue(xlsxResult);
  });

  describe("parse", () => {
    it("should delegate to PdfParser for PDF mime type", async () => {
      const result = await parser.parse(buffer, "application/pdf");

      expect(result).toEqual(pdfResult);
      expect(mockPdfParse).toHaveBeenCalledWith(buffer, "application/pdf");
    });

    it("should delegate to DocxParser for DOCX mime type", async () => {
      const mime =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const result = await parser.parse(buffer, mime);

      expect(result).toEqual(docxResult);
      expect(mockDocxParse).toHaveBeenCalledWith(buffer, mime);
    });

    it("should delegate to XlsxParser for XLSX mime type", async () => {
      const mime =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const result = await parser.parse(buffer, mime);

      expect(result).toEqual(xlsxResult);
      expect(mockXlsxParse).toHaveBeenCalledWith(buffer, mime);
    });

    it("should throw when no parser supports the mime type", async () => {
      await expect(parser.parse(buffer, "image/png")).rejects.toThrow(
        "No parser found for MIME type: image/png",
      );
    });
  });

  describe("supports", () => {
    it.each([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ])("should return true for %s", (mime) => {
      expect(parser.supports(mime)).toBe(true);
    });

    it.each(["image/png", "text/plain", "application/json"])(
      "should return false for %s",
      (mime) => {
        expect(parser.supports(mime)).toBe(false);
      },
    );
  });
});
