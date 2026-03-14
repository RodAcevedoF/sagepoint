import { DocxParser } from "../../src/parsers/docx.parser";

const mockExtractRawText = jest.fn();

jest.mock("mammoth", () => {
  return {
    __esModule: true,
    default: {
      extractRawText: (...args: unknown[]): Promise<unknown> =>
        mockExtractRawText(...args) as Promise<unknown>,
    },
  };
});

describe("DocxParser", () => {
  let parser: DocxParser;
  const buffer = Buffer.from("fake-docx");
  const docxMime =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const docMime = "application/msword";

  beforeEach(() => {
    jest.clearAllMocks();
    parser = new DocxParser();

    mockExtractRawText.mockResolvedValue({
      value: "DOCX content here",
      messages: [],
    });
  });

  describe("parse", () => {
    it("should extract text from DOCX buffer", async () => {
      const result = await parser.parse(buffer, docxMime);

      expect(result.text).toBe("DOCX content here");
      expect(result.metadata.warnings).toEqual([]);
      expect(mockExtractRawText).toHaveBeenCalledWith({ buffer });
    });

    it("should include warnings in metadata", async () => {
      mockExtractRawText.mockResolvedValue({
        value: "content",
        messages: [
          { message: 'Unknown style "Heading"' },
          { message: "Empty paragraph" },
        ],
      });

      const result = await parser.parse(buffer, docxMime);

      expect(result.metadata.warnings).toEqual([
        'Unknown style "Heading"',
        "Empty paragraph",
      ]);
    });

    it("should parse application/msword mime type", async () => {
      const result = await parser.parse(buffer, docMime);

      expect(result.text).toBe("DOCX content here");
    });

    it("should throw on unsupported mime type", async () => {
      await expect(parser.parse(buffer, "application/pdf")).rejects.toThrow(
        "Unsupported MIME type: application/pdf",
      );
    });
  });

  describe("supports", () => {
    it("should return true for DOCX mime type", () => {
      expect(parser.supports(docxMime)).toBe(true);
    });

    it("should return true for DOC mime type", () => {
      expect(parser.supports(docMime)).toBe(true);
    });

    it.each(["application/pdf", "text/plain", "image/png"])(
      "should return false for %s",
      (type) => {
        expect(parser.supports(type)).toBe(false);
      },
    );
  });
});
