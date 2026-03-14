import { PdfParser } from "../../src/parsers/pdf.parser";

const mockGetText = jest.fn();
const mockGetInfo = jest.fn();
const mockDestroy = jest.fn();

jest.mock("pdf-parse", () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: mockGetText,
    getInfo: mockGetInfo,
    destroy: mockDestroy,
  })),
}));

describe("PdfParser", () => {
  let parser: PdfParser;
  const buffer = Buffer.from("fake-pdf");
  const mimeType = "application/pdf";

  beforeEach(() => {
    jest.clearAllMocks();
    parser = new PdfParser();

    mockGetText.mockResolvedValue({ text: "PDF content here" });
    mockGetInfo.mockResolvedValue({ total: 3, info: { Title: "Test" } });
    mockDestroy.mockResolvedValue(undefined);
  });

  describe("parse", () => {
    it("should parse PDF and return text with metadata", async () => {
      const result = await parser.parse(buffer, mimeType);

      expect(result.text).toBe("PDF content here");
      expect(result.metadata.pageCount).toBe(3);
      expect(result.metadata.info).toEqual({ Title: "Test" });
    });

    it("should call destroy after successful parsing", async () => {
      await parser.parse(buffer, mimeType);

      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it("should call destroy even if getText fails", async () => {
      mockGetText.mockRejectedValue(new Error("parse error"));

      await expect(parser.parse(buffer, mimeType)).rejects.toThrow(
        "parse error",
      );
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it("should throw on unsupported mime type", async () => {
      await expect(parser.parse(buffer, "text/plain")).rejects.toThrow(
        "Unsupported MIME type: text/plain",
      );
    });
  });

  describe("supports", () => {
    it("should return true for application/pdf", () => {
      expect(parser.supports("application/pdf")).toBe(true);
    });

    it.each(["text/plain", "application/msword", "image/png"])(
      "should return false for %s",
      (type) => {
        expect(parser.supports(type)).toBe(false);
      },
    );
  });
});
