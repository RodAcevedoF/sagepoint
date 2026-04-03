"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useGetSuggestionsQuery } from "@/infrastructure/api/roadmapApi";
import { Card } from "@/common/components";
import { palette } from "@/common/theme";

const MotionBox = motion.create(Box);

interface SuggestionsPanelProps {
  roadmapId: string;
}

export function SuggestionsPanel({ roadmapId }: SuggestionsPanelProps) {
  const { data: suggestions, isLoading } = useGetSuggestionsQuery(roadmapId);

  if (isLoading || !suggestions || suggestions.length === 0) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(palette.primary.main, 0.15),
            color: palette.primary.light,
            border: `1px solid ${alpha(palette.primary.main, 0.25)}`,
          }}
        >
          <Compass size={18} />
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: palette.primary.light }}
        >
          Related Topics
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {suggestions.map((suggestion, index) => (
          <MotionBox
            key={suggestion.concept.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card variant="glass" sx={{ height: "100%" }}>
              <Card.Content>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: palette.primary.light,
                  }}
                >
                  {suggestion.concept.name}
                </Typography>
                {suggestion.concept.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha(palette.text.primary, 0.6),
                      mb: 1.5,
                      lineHeight: 1.55,
                    }}
                  >
                    {suggestion.concept.description}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: alpha(palette.primary.dark, 0.45),
                    border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: palette.primary.light, fontWeight: 500 }}
                  >
                    {suggestion.relevance}
                  </Typography>
                </Box>
              </Card.Content>
            </Card>
          </MotionBox>
        ))}
      </Box>
    </Box>
  );
}
