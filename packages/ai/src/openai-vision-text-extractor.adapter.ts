import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IImageTextExtractionService } from "@sagepoint/domain";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { resolveOpenAiConfig, createChatModel } from "./llm-config";
import type { LlmAdapterConfig } from "./llm-config";

@Injectable()
export class OpenAiVisionTextExtractorAdapter implements IImageTextExtractionService {
  private readonly model: ChatOpenAI;
  private readonly logger = new Logger(OpenAiVisionTextExtractorAdapter.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | LlmAdapterConfig,
  ) {
    const resolved = resolveOpenAiConfig(
      configOrService,
      "MODEL_VISION_TEXT_EXTRACTION",
    );
    this.model = createChatModel({
      ...resolved,
      modelName: resolved.modelName || "gpt-4o-mini",
      temperature: 0,
    });
  }

  async extractText(imageBuffer: Buffer, mimeType: string): Promise<string> {
    this.logger.log(
      `Extracting text from image (${mimeType}, ${imageBuffer.length} bytes)`,
    );

    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: "Extract ALL text content from this image. If the image contains a document, article, slide, or any readable content, transcribe it fully. If the image is a diagram or chart, describe its content in detail including any labels, data, and relationships. Return only the extracted text with no additional commentary.",
        },
        {
          type: "image_url",
          image_url: { url: dataUrl },
        },
      ],
    });

    const response = await this.model.invoke([message]);
    const text = typeof response.content === "string" ? response.content : "";

    this.logger.log(`Extracted ${text.length} chars from image`);
    return text;
  }
}
