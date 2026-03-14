import * as XLSX from "xlsx";
import { XlsxParser } from "../../src/parsers/xlsx.parser";

describe("XlsxParser", () => {
  let parser: XlsxParser;
  const xlsxMime =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const xlsMime = "application/vnd.ms-excel";

  beforeEach(() => {
    parser = new XlsxParser();
  });

  function createWorkbookBuffer(sheets: Record<string, string[][]>): Buffer {
    const workbook = XLSX.utils.book_new();
    for (const [name, data] of Object.entries(sheets)) {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    }
    const arrayBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    }) as ArrayBuffer;
    return Buffer.from(arrayBuffer);
  }

  describe("parse", () => {
    it("should parse XLSX and return CSV text with sheet headers", async () => {
      const buffer = createWorkbookBuffer({
        Sheet1: [
          ["Name", "Age"],
          ["Alice", "30"],
        ],
      });

      const result = await parser.parse(buffer, xlsxMime);

      expect(result.text).toContain("--- Sheet: Sheet1 ---");
      expect(result.text).toContain("Name,Age");
      expect(result.text).toContain("Alice,30");
    });

    it("should include sheetCount and sheetNames in metadata", async () => {
      const buffer = createWorkbookBuffer({
        Data: [["A"]],
      });

      const result = await parser.parse(buffer, xlsxMime);

      expect(result.metadata.sheetCount).toBe(1);
      expect(result.metadata.sheetNames).toEqual(["Data"]);
    });

    it("should handle multiple sheets", async () => {
      const buffer = createWorkbookBuffer({
        Users: [["Name"], ["Bob"]],
        Products: [["Item"], ["Widget"]],
      });

      const result = await parser.parse(buffer, xlsxMime);

      expect(result.text).toContain("--- Sheet: Users ---");
      expect(result.text).toContain("--- Sheet: Products ---");
      expect(result.text).toContain("Bob");
      expect(result.text).toContain("Widget");
      expect(result.metadata.sheetCount).toBe(2);
      expect(result.metadata.sheetNames).toEqual(["Users", "Products"]);
    });

    it("should throw on unsupported mime type", () => {
      const buffer = createWorkbookBuffer({ S: [["x"]] });

      expect(() => parser.parse(buffer, "application/pdf")).toThrow(
        "Unsupported MIME type: application/pdf",
      );
    });
  });

  describe("supports", () => {
    it("should return true for XLSX mime type", () => {
      expect(parser.supports(xlsxMime)).toBe(true);
    });

    it("should return true for XLS mime type", () => {
      expect(parser.supports(xlsMime)).toBe(true);
    });

    it.each(["application/pdf", "text/plain", "image/png"])(
      "should return false for %s",
      (type) => {
        expect(parser.supports(type)).toBe(false);
      },
    );
  });
});
