"use client";

import { Box, Typography, Chip, alpha, useTheme } from "@mui/material";
import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/shared/components";
import type { ReviewQueueQuestionDto } from "@/infrastructure/api/reviewApi";

interface ReviewQuestionCardProps {
  question: ReviewQueueQuestionDto;
  selectedAnswer?: string;
  onAnswer: (label: string) => void;
  disabled?: boolean;
}

export function ReviewQuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
}: ReviewQuestionCardProps) {
  const theme = useTheme();

  return (
    <Card variant="outlined">
      <Card.Content sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5 }}>
          {question.text}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.label;
            const borderColor = isSelected
              ? alpha(theme.palette.primary.main, 0.5)
              : alpha(theme.palette.divider, 0.2);
            const bgColor = isSelected
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.background.paper, 0.3);

            return (
              <Box
                key={option.label}
                onClick={() => !disabled && onAnswer(option.label)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  cursor: disabled ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  border: `1px solid ${borderColor}`,
                  bgcolor: bgColor,
                  transition: "all 0.15s ease",
                  ...(!disabled && {
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                  }),
                }}
              >
                {isSelected ? (
                  <CheckCircle2
                    size={18}
                    color={theme.palette.primary.light}
                    style={{ flexShrink: 0 }}
                  />
                ) : (
                  <Circle
                    size={18}
                    color={alpha(theme.palette.text.secondary, 0.4)}
                    style={{ flexShrink: 0 }}
                  />
                )}
                <Chip
                  label={option.label}
                  size="small"
                  sx={{
                    minWidth: 28,
                    height: 24,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.text.secondary, 0.1),
                    color: isSelected
                      ? theme.palette.primary.light
                      : theme.palette.text.secondary,
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {option.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Card.Content>
    </Card>
  );
}
