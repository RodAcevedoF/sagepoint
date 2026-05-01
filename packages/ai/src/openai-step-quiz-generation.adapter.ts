import { Injectable, Logger, Optional, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  IStepQuizGenerationService,
  StepQuizInput,
  GeneratedStepQuiz,
} from "@sagepoint/domain";
import { QuestionType } from "@sagepoint/domain";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { resolveOpenAiConfig, createChatModel } from "./llm-config";
import type { LlmAdapterConfig } from "./llm-config";

@Injectable()
export class OpenAiStepQuizGenerationAdapter implements IStepQuizGenerationService {
  private readonly logger = new Logger(OpenAiStepQuizGenerationAdapter.name);

  private readonly model: ChatOpenAI;

  constructor(
    @Optional()
    @Inject(ConfigService)
    configOrService?: ConfigService | LlmAdapterConfig,
  ) {
    const resolved = resolveOpenAiConfig(
      configOrService,
      "MODEL_STEP_QUIZ_GENERATION",
    );
    this.model = createChatModel({
      ...resolved,
      modelName: resolved.modelName || "gpt-4o-mini",
      temperature: 0.3,
    });
  }

  async generateForSteps(steps: StepQuizInput[]): Promise<GeneratedStepQuiz[]> {
    if (steps.length === 0) return [];

    this.logger.log(`Generating step quizzes for ${steps.length} steps`);

    const questionCount = steps[0].questionCount ?? 2;

    const schema = z.object({
      results: z.array(
        z.object({
          conceptId: z.string().describe("The conceptId from the input step"),
          questions: z.array(
            z.object({
              type: z
                .enum(["MULTIPLE_CHOICE"])
                .describe("Always MULTIPLE_CHOICE"),
              text: z.string().describe("The question text"),
              options: z
                .array(
                  z.object({
                    label: z
                      .string()
                      .describe("Single uppercase letter: A, B, C, or D"),
                    text: z.string().describe("Option text"),
                    isCorrect: z
                      .boolean()
                      .describe("True for exactly one option"),
                  }),
                )
                .length(4)
                .describe("Exactly 4 options"),
              explanation: z
                .string()
                .describe("One-sentence explanation of the correct answer"),
              difficulty: z
                .enum(["beginner", "intermediate", "advanced", "expert"])
                .describe("Question difficulty matching the step difficulty"),
            }),
          ),
        }),
      ),
    });

    const structuredModel = this.model.withStructuredOutput(schema);

    const stepsText = steps
      .map(
        (s, i) =>
          `Step ${i + 1} (conceptId: "${s.conceptId}"):
  Concept: ${s.conceptName}${s.conceptDescription ? ` — ${s.conceptDescription}` : ""}
  Learning objective: ${s.learningObjective ?? "not specified"}
  Rationale: ${s.rationale ?? "not specified"}
  Difficulty: ${s.difficulty ?? "intermediate"}
  Questions to generate: ${s.questionCount ?? questionCount}`,
      )
      .join("\n\n");

    const result = await structuredModel.invoke([
      {
        role: "system",
        content: `You are an expert educational quiz designer. Generate ${questionCount} MULTIPLE_CHOICE questions per step.

Guidelines:
- Return one result object per step, in the same order, with the exact conceptId from the input.
- Ground each question in the step's learningObjective and rationale — test understanding of WHY the step matters, not just terminology recall.
- 4 options (A, B, C, D), exactly one correct.
- Difficulty should match the step's stated difficulty.
- One brief explanation sentence per question.`,
      },
      {
        role: "user",
        content: `Generate quiz questions for these roadmap steps:\n\n${stepsText}`,
      },
    ]);

    this.logger.log(`Generated quizzes for ${result.results.length} steps`);

    return result.results.map((r) => ({
      conceptId: r.conceptId,
      questions: r.questions.map((q) => ({
        type: q.type as QuestionType,
        text: q.text,
        options: q.options,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    }));
  }
}
