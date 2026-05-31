"use client";

import { Box } from "@mui/material";
import { Brain, ArrowRight, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, Pill } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";
import type { QuizDto } from "@/infrastructure/api/documentApi";

interface QuizCardProps {
  documentId: string;
  quiz: QuizDto;
}

export function QuizCard({ documentId, quiz }: QuizCardProps) {
  const router = useRouter();

  return (
    <Card
      variant="aurora"
      tone="concept"
      withAura={false}
      onClick={() => router.push(`/documents/${documentId}/quiz/${quiz.id}`)}
      sx={{ maxWidth: 560 }}
    >
      <Card.Body
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: "18px",
          padding: "22px 24px",
        }}
      >
        <Card.Icon
          sx={{
            width: 52,
            height: 52,
            borderRadius: "14px",
          }}
        >
          <Brain size={26} />
        </Card.Icon>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            component="p"
            sx={{
              fontFamily: auroraPalette.font.display,
              fontWeight: 700,
              fontSize: "18px",
              color: auroraPalette.txHi,
              letterSpacing: "-0.01em",
              margin: "0 0 8px",
            }}
          >
            {quiz.title}
          </Box>
          <Pill tone="concept" icon={<CheckSquare size={13} />}>
            {quiz.questionCount} questions
          </Pill>
        </Box>

        <Box
          component="span"
          sx={{
            flex: "none",
            width: 40,
            height: 40,
            borderRadius: "11px",
            display: "grid",
            placeItems: "center",
            background: auroraTint(auroraPalette.status.concept, 0.12),
            border: `1px solid ${auroraTint(auroraPalette.status.concept, 0.28)}`,
            color: auroraPalette.status.concept,
          }}
        >
          <ArrowRight size={18} />
        </Box>
      </Card.Body>
    </Card>
  );
}
