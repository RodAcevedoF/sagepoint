import { ChatOpenAI } from "@langchain/openai";
import type { ConfigService } from "@nestjs/config";

export interface LlmAdapterConfig {
  apiKey: string;
  modelName?: string;
}

export interface LlmModelConfig {
  apiKey: string;
  modelName?: string;
  temperature?: number;
  maxRetries?: number;
  timeout?: number;
  maxConcurrency?: number;
  baseURL?: string;
}

const OPENAI_DEFAULTS = {
  maxRetries: 3,
  timeout: 60_000,
  maxConcurrency: 5,
} as const;

const PERPLEXITY_DEFAULTS = {
  maxRetries: 3,
  timeout: 45_000,
  maxConcurrency: 3,
} as const;

export function createChatModel(config: LlmModelConfig): ChatOpenAI {
  const isPerplexity = !!config.baseURL;
  const defaults = isPerplexity ? PERPLEXITY_DEFAULTS : OPENAI_DEFAULTS;

  return new ChatOpenAI({
    apiKey: config.apiKey,
    modelName: config.modelName,
    temperature: config.temperature ?? 0.3,
    maxRetries: config.maxRetries ?? defaults.maxRetries,
    timeout: config.timeout ?? defaults.timeout,
    maxConcurrency: config.maxConcurrency ?? defaults.maxConcurrency,
    ...(config.baseURL ? { configuration: { baseURL: config.baseURL } } : {}),
  });
}

export function resolveOpenAiConfig(
  configOrService: ConfigService | LlmAdapterConfig | undefined,
  modelEnvKey: string,
): LlmAdapterConfig {
  if (configOrService && "apiKey" in configOrService) {
    return {
      apiKey: configOrService.apiKey,
      modelName: configOrService.modelName,
    };
  }
  if (configOrService && "get" in configOrService) {
    return {
      apiKey: configOrService.get<string>("OPENAI_API_KEY") ?? "",
      modelName: configOrService.get<string>(modelEnvKey),
    };
  }
  return { apiKey: process.env.OPENAI_API_KEY ?? "" };
}

export function resolvePerplexityConfig(
  configOrService: ConfigService | { apiKey: string } | undefined,
): { apiKey: string } {
  if (configOrService && "apiKey" in configOrService) {
    return { apiKey: configOrService.apiKey };
  }
  if (configOrService && "get" in configOrService) {
    return { apiKey: configOrService.get<string>("PERPLEXITY_API_KEY") ?? "" };
  }
  return { apiKey: process.env.PERPLEXITY_API_KEY ?? "" };
}
