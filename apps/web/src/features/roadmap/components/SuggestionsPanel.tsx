"use client";

import { Box } from "@mui/material";
import { Compass, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useGetSuggestionsQuery } from "@/infrastructure/api/roadmapApi";
import { Card, Pill } from "@/shared/components";
import { aurora as auroraPalette, auroraTint } from "@/shared/theme";

const MotionBox = motion.create(Box);

interface SuggestionsPanelProps {
  roadmapId: string;
}

export function SuggestionsPanel({ roadmapId }: SuggestionsPanelProps) {
  const { data: suggestions, isLoading } = useGetSuggestionsQuery(roadmapId);

  if (isLoading || !suggestions || suggestions.length === 0) return null;

  return (
    <Box sx={{ marginTop: "18px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "13px",
            display: "grid",
            placeItems: "center",
            background: `color-mix(in oklch, ${auroraPalette.teal} 15%, ${auroraPalette.surface2})`,
            border: `1px solid ${auroraTint(auroraPalette.teal, 0.26)}`,
            color: auroraPalette.teal,
          }}
        >
          <Compass size={22} />
        </Box>
        <Box
          component="h2"
          sx={{
            margin: 0,
            fontFamily: auroraPalette.font.display,
            fontWeight: 700,
            fontSize: "24px",
            color: auroraPalette.txHi,
            letterSpacing: "-0.015em",
          }}
        >
          Related Topics
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: "18px",
        }}
      >
        {suggestions.map((suggestion, index) => (
          <MotionBox
            key={suggestion.concept.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            sx={{ display: "flex" }}
          >
            <Card variant="aurora" tone="teal" withAura={false}>
              <Card.Body
                sx={{
                  gap: "12px",
                  padding: { xs: "22px 22px 20px", md: "22px 22px 20px" },
                }}
              >
                <Box
                  component="h3"
                  sx={{
                    margin: 0,
                    fontFamily: auroraPalette.font.display,
                    fontWeight: 700,
                    fontSize: "17.5px",
                    color: auroraPalette.teal,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {suggestion.concept.name}
                </Box>
                {suggestion.concept.description && (
                  <Box
                    component="p"
                    sx={{
                      margin: 0,
                      fontSize: "13.5px",
                      lineHeight: 1.55,
                      color: auroraPalette.txMid,
                      textWrap: "pretty",
                      flex: 1,
                    }}
                  >
                    {suggestion.concept.description}
                  </Box>
                )}
                <Box sx={{ display: "flex" }}>
                  <Pill tone="teal" icon={<LinkIcon size={12} />}>
                    {suggestion.relevance}
                  </Pill>
                </Box>
              </Card.Body>
            </Card>
          </MotionBox>
        ))}
      </Box>
    </Box>
  );
}
