import { randomUUID } from "crypto";
import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  IStepQuizGenerationService,
  StepQuizInput,
  GeneratedStepQuiz,
} from "@sagepoint/domain";
import { QuestionType } from "@sagepoint/domain";
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";
import { traceable } from "langsmith/traceable";
import { z } from "zod";
import { resolveCerebrasConfig, createCerebrasClient } from "./llm-config";
import type { LlmAdapterConfig } from "./llm-config";

const QUIZ_JSON_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          conceptId: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["MULTIPLE_CHOICE"] },
                text: { type: "string" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      text: { type: "string" },
                      isCorrect: { type: "boolean" },
                    },
                    required: ["label", "text", "isCorrect"],
                    additionalProperties: false,
                  },
                },
                explanation: { type: "string" },
                difficulty: {
                  type: "string",
                  enum: ["beginner", "intermediate", "advanced", "expert"],
                },
              },
              required: [
                "type",
                "text",
                "options",
                "explanation",
                "difficulty",
              ],
              additionalProperties: false,
            },
          },
        },
        required: ["conceptId", "questions"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
} as const;

const zodSchema = z.object({
  results: z.array(
    z.object({
      conceptId: z.string(),
      questions: z.array(
        z.object({
          type: z.enum(["MULTIPLE_CHOICE"]),
          text: z.string(),
          options: z.array(
            z.object({
              label: z.string(),
              text: z.string(),
              isCorrect: z.boolean(),
            }),
          ),
          explanation: z.string(),
          difficulty: z.enum([
            "beginner",
            "intermediate",
            "advanced",
            "expert",
          ]),
        }),
      ),
    }),
  ),
});

const completionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
      }),
    }),
  ),
});

@Injectable()
export class CerebrasStepQuizEnrichmentAdapter implements IStepQuizGenerationService {
  private readonly logger = new Logger(CerebrasStepQuizEnrichmentAdapter.name);
  private readonly client: Cerebras;
  private readonly modelName: string;

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | LlmAdapterConfig,
  ) {
    const resolved = resolveCerebrasConfig(configOrService);
    this.client = createCerebrasClient(resolved);
    this.modelName = resolved.modelName || "llama3.1-70b";
  }

  async generateForSteps(steps: StepQuizInput[]): Promise<GeneratedStepQuiz[]> {
    if (steps.length === 0) return [];

    this.logger.log(`Enriching step quizzes for ${steps.length} steps`);

    const questionCount = steps[0].questionCount ?? 2;

    const stepsText = steps
      .map(
        (s, i) =>
          `Step ${i + 1} (conceptId: "${s.conceptId}"):
  Concept: ${s.conceptName}${s.conceptDescription ? ` — ${s.conceptDescription}` : ""}
  Learning objective: ${s.learningObjective ?? "not specified"}
  Rationale: ${s.rationale ?? "not specified"}
  Difficulty: ${s.difficulty ?? "intermediate"}
  Questions to generate: ${s.questionCount ?? questionCount}${
    s.resourceSnippets && s.resourceSnippets.length > 0
      ? `\n  Resources:\n${s.resourceSnippets.map((r) => `    - ${r.slice(0, 300)}`).join("\n")}`
      : ""
  }`,
      )
      .join("\n\n");

    const systemPrompt = `You are an expert educational quiz designer. Generate ${questionCount} MULTIPLE_CHOICE questions per step.

Guidelines:
- Return one result object per step, in the same order, with the exact conceptId from the input.
- Use the provided resource snippets to ground questions in real-world material — reference what a learner would actually read/watch, not just abstract concepts.
- Ground each question in the step's learningObjective and rationale — test understanding of WHY the step matters, not just terminology recall.
- 4 options (A, B, C, D), exactly one correct.
- Difficulty should match the step's stated difficulty.
- One brief explanation sentence per question.`;

    const response = await traceable(
      () =>
        this.client.chat.completions.create({
          model: this.modelName,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate quiz questions for these roadmap steps:\n\n${stepsText}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "QuizResults",
              schema: QUIZ_JSON_SCHEMA,
              strict: true,
            },
          },
        }),
      { name: "cerebras.step-quiz-enrichment", run_type: "llm" },
    )();

    const completion = completionSchema.parse(response);
    const firstChoice = completion.choices.at(0);

    if (!firstChoice) {
      throw new Error("Cerebras returned no quiz completion choices");
    }

    const raw: unknown = JSON.parse(firstChoice.message.content);
    const parsed = zodSchema.parse(raw);

    this.logger.log(`Enriched quizzes for ${parsed.results.length} steps`);

    return parsed.results.map((r) => ({
      conceptId: r.conceptId,
      questions: r.questions.map((q) => ({
        id: randomUUID(),
        type: q.type as QuestionType,
        text: q.text,
        options: q.options,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    }));
  }
}
