"use client";

import { Box } from "@mui/material";
import { CheckCircle2, Circle, Lightbulb } from "lucide-react";
import { Card } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { QuestionDto } from "@/infrastructure/api/documentApi";

type OptionState = "idle" | "selected" | "correct" | "wrong";

function optionColor(state: OptionState): string {
  switch (state) {
    case "correct":
      return auroraPalette.status.ready;
    case "wrong":
      return auroraPalette.status.fail;
    case "selected":
      return auroraPalette.status.concept;
    case "idle":
      return auroraPalette.txMid;
  }
}

interface QuestionCardProps {
  question: QuestionDto;
  selectedAnswer?: string;
  onAnswer: (questionId: string, answer: string) => void;
  showResult?: boolean;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  showResult,
}: QuestionCardProps) {
  return (
    <Card variant="aurora" tone="concept" hoverable={false} withAura={false}>
      <Card.Body
        sx={{ padding: { xs: "22px 22px 24px", md: "26px 30px 28px" } }}
      >
        <Box
          component="p"
          sx={{
            fontFamily: auroraPalette.font.display,
            fontWeight: 700,
            fontSize: "18px",
            color: auroraPalette.txHi,
            lineHeight: 1.4,
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}
        >
          {question.order + 1}. {question.text}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.label;
            let state: OptionState = "idle";
            if (showResult && option.isCorrect) state = "correct";
            else if (showResult && isSelected && !option.isCorrect)
              state = "wrong";
            else if (isSelected) state = "selected";

            const accent = optionColor(state);
            const isActive = state !== "idle";

            return (
              <Box
                key={option.label}
                onClick={() =>
                  !showResult && onAnswer(question.id, option.label)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: auroraPalette.radii.md,
                  cursor: showResult ? "default" : "pointer",
                  background: isActive
                    ? auroraTint(accent, 0.1)
                    : "oklch(0.27 0.022 262 / 0.4)",
                  border: `1px solid ${
                    isActive ? auroraTint(accent, 0.4) : auroraPalette.line
                  }`,
                  color: auroraPalette.tx,
                  fontSize: "15px",
                  lineHeight: 1.5,
                  transition: "background .15s, border-color .15s",
                  ...(!showResult && {
                    "&:hover": {
                      background: auroraTint(
                        auroraPalette.status.concept,
                        0.08,
                      ),
                      borderColor: auroraTint(
                        auroraPalette.status.concept,
                        0.3,
                      ),
                    },
                  }),
                }}
              >
                <Box
                  component="span"
                  sx={{ flexShrink: 0, display: "inline-flex", color: accent }}
                >
                  {isActive ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </Box>
                <Box
                  component="span"
                  sx={{
                    flexShrink: 0,
                    minWidth: 28,
                    height: 24,
                    px: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: auroraPalette.radii.pill,
                    fontFamily: auroraPalette.font.mono,
                    fontSize: "11px",
                    fontWeight: 700,
                    background: auroraTint(accent, 0.18),
                    color: accent,
                  }}
                >
                  {option.label}
                </Box>
                <Box component="span" sx={{ flex: 1 }}>
                  {option.text}
                </Box>
              </Box>
            );
          })}
        </Box>

        {showResult && question.explanation && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginTop: "4px",
              padding: "14px 16px",
              borderRadius: auroraPalette.radii.md,
              background: auroraTint(auroraPalette.status.proc, 0.08),
              border: `1px solid ${auroraTint(auroraPalette.status.proc, 0.2)}`,
              color: auroraPalette.txMid,
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            <Box
              component="span"
              sx={{
                flexShrink: 0,
                display: "inline-flex",
                color: auroraPalette.status.proc,
                marginTop: "2px",
              }}
            >
              <Lightbulb size={16} />
            </Box>
            {question.explanation}
          </Box>
        )}
      </Card.Body>
    </Card>
  );
}
