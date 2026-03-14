import {
  resetFake,
  setPlainInvokeResult,
  setInvokeError,
  getInvocations,
} from "./_fakes/langchain.fake";
import { OpenAiVisionTextExtractorAdapter } from "../src/openai-vision-text-extractor.adapter";

describe("OpenAiVisionTextExtractorAdapter", () => {
  let adapter: OpenAiVisionTextExtractorAdapter;

  beforeEach(() => {
    resetFake();
    adapter = new OpenAiVisionTextExtractorAdapter({ apiKey: "test-key" });
  });

  describe("extractText", () => {
    it("returns text content from model response", async () => {
      setPlainInvokeResult({ content: "Extracted document text here" });

      const result = await adapter.extractText(
        Buffer.from("fake-image-data"),
        "image/png",
      );

      expect(result).toBe("Extracted document text here");
    });

    it("returns empty string when content is not a string", async () => {
      setPlainInvokeResult({ content: [{ type: "text", text: "chunk" }] });

      const result = await adapter.extractText(
        Buffer.from("data"),
        "image/jpeg",
      );

      expect(result).toBe("");
    });

    it("encodes buffer as base64 data URL in the message", async () => {
      setPlainInvokeResult({ content: "text" });
      const imageData = Buffer.from("test-png");

      await adapter.extractText(imageData, "image/png");

      const invocations = getInvocations();
      expect(invocations).toHaveLength(1);

      // The message is a HumanMessage with content array
      const message = invocations[0].messages[0] as {
        content: Array<{ type: string; image_url?: { url: string } }>;
      };
      const imageBlock = message.content.find(
        (c: { type: string }) => c.type === "image_url",
      );
      expect(imageBlock?.image_url?.url).toContain("data:image/png;base64,");
      expect(imageBlock?.image_url?.url).toContain(
        imageData.toString("base64"),
      );
    });

    it("rethrows errors from the model", async () => {
      setInvokeError(new Error("Vision API error"));

      await expect(
        adapter.extractText(Buffer.from("data"), "image/png"),
      ).rejects.toThrow("Vision API error");
    });
  });
});
