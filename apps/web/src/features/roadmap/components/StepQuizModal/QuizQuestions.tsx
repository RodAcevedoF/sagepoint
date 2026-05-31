"use client";

import { Box } from "@mui/material";
import { CheckCircle2, Circle, Info, Send, X } from "lucide-react";
import { Button, Card } from "@/shared/components";
import {
  ButtonVariants,
  ButtonSizes,
  ButtonIconPositions,
} from "@/shared/types";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { StepQuizQuestionDto } from "@/infrastructure/api/roadmapApi";

interface QuizQuestionsProps {
  questions: StepQuizQuestionDto[];
  answers: Record<number, string>;
  error: string | null;
  isSubmitting: boolean;
  allAnswered: boolean;
  onSelectAnswer: (questionIndex: number, label: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function QuizQuestions({
  questions,
  answers,
  error,
  isSubmitting,
  allAnswered,
  onSelectAnswer,
  onSubmit,
  onClose,
}: QuizQuestionsProps) {
  const answeredCount = Object.keys(answers).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px", py: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          padding: "14px 16px",
          borderRadius: auroraPalette.radii.md,
          background: auroraTint(auroraPalette.status.concept, 0.06),
          border: `1px solid ${auroraTint(auroraPalette.status.concept, 0.2)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Info size={16} color={auroraPalette.status.concept} />
          <Box
            component="span"
            sx={{ fontSize: "13.5px", color: auroraPalette.txMid }}
          >
            Answer at least 2 out of 3 correctly to complete this step.
          </Box>
        </Box>
        <Box
          component="span"
          sx={{
            flex: "none",
            padding: "4px 11px",
            borderRadius: auroraPalette.radii.pill,
            fontFamily: auroraPalette.font.mono,
            fontSize: "12px",
            fontWeight: 700,
            background: auroraTint(auroraPalette.teal, 0.15),
            color: auroraPalette.teal,
          }}
        >
          {answeredCount}/{questions.length}
        </Box>
      </Box>

      {error && (
        <Box
          component="p"
          sx={{
            margin: 0,
            textAlign: "center",
            color: auroraPalette.status.fail,
          }}
        >
          {error}
        </Box>
      )}

      {questions.map((q, qi) => (
        <Card
          key={qi}
          variant="aurora"
          tone="concept"
          hoverable={false}
          withAura={false}
        >
          <Card.Body
            sx={{ padding: { xs: "18px 18px 20px", md: "22px 24px 24px" } }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <Box
                component="span"
                sx={{
                  flex: "none",
                  minWidth: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: auroraTint(auroraPalette.teal, 0.14),
                  color: auroraPalette.teal,
                  fontFamily: auroraPalette.font.mono,
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {qi + 1}
              </Box>
              <Box
                component="p"
                sx={{
                  margin: 0,
                  fontFamily: auroraPalette.font.display,
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: 1.4,
                  color: auroraPalette.txHi,
                  letterSpacing: "-0.005em",
                }}
              >
                {q.text}
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {q.options.map((opt) => {
                const isSelected = answers[qi] === opt.label;
                const accent = isSelected
                  ? auroraPalette.status.concept
                  : auroraPalette.txMid;
                return (
                  <Box
                    key={opt.label}
                    onClick={() => onSelectAnswer(qi, opt.label)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: auroraPalette.radii.md,
                      cursor: "pointer",
                      background: isSelected
                        ? auroraTint(auroraPalette.status.concept, 0.1)
                        : "oklch(0.27 0.022 262 / 0.4)",
                      border: `1px solid ${
                        isSelected
                          ? auroraTint(auroraPalette.status.concept, 0.4)
                          : auroraPalette.line
                      }`,
                      color: auroraPalette.tx,
                      transition: "background .15s, border-color .15s",
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
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        flexShrink: 0,
                        display: "inline-flex",
                        color: accent,
                      }}
                    >
                      {isSelected ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
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
                      {opt.label}
                    </Box>
                    <Box component="span" sx={{ flex: 1, fontSize: "14px" }}>
                      {opt.text}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card.Body>
        </Card>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button
          label="Cancel"
          icon={X}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.AURORA_OUTLINE}
          size={ButtonSizes.MEDIUM}
          onClick={onClose}
          disabled={isSubmitting}
        />
        <Button
          label={isSubmitting ? "Submitting..." : "Submit"}
          icon={Send}
          iconPos={ButtonIconPositions.START}
          variant={ButtonVariants.AURORA}
          size={ButtonSizes.MEDIUM}
          onClick={onSubmit}
          disabled={!allAnswered || isSubmitting}
          loading={isSubmitting}
        />
      </Box>
    </Box>
  );
}
