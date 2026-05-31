"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Layers, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { aurora, auroraTint } from "@/shared/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { ONBOARDING_STEP_TONE } from "../../utils/onboarding.utils";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";

const chipBaseSx = {
  py: 2.25,
  px: 1,
  borderRadius: aurora.radii.sm,
  fontSize: "0.875rem",
  fontFamily: aurora.font.ui,
  fontWeight: 500,
  transition: "all 0.2s ease",
};

export function InterestsStep() {
  const { data, updateData } = useOnboarding();
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const [customInput, setCustomInput] = useState("");

  const customInterests = data.interests
    .filter((i) => i.startsWith("custom:"))
    .map((i) => i.replace("custom:", ""));

  const selectedCategoryIds = data.interests.filter(
    (i) => !i.startsWith("custom:"),
  );

  const toggleInterest = (id: string) => {
    const newInterests = data.interests.includes(id)
      ? data.interests.filter((i) => i !== id)
      : [...data.interests, id];
    updateData("interests", newInterests);
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim().toLowerCase().slice(0, 50);
    if (!trimmed) return;

    const customId = `custom:${trimmed}`;
    if (!data.interests.includes(customId)) {
      updateData("interests", [...data.interests, customId]);
    }
    setCustomInput("");
  };

  const removeCustomInterest = (interest: string) => {
    updateData(
      "interests",
      data.interests.filter((i) => i !== `custom:${interest}`),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomInterest();
    }
  };

  return (
    <OnboardingCard
      icon={<Layers size={32} />}
      title="Select your interests"
      subtitle="Choose topics you'd like to explore. You can always change these later."
      canProceed={data.interests.length > 0}
      tone={ONBOARDING_STEP_TONE.interests}
    >
      <Box>
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1.5,
            py: 0.5,
            mb: 2,
            borderRadius: aurora.radii.sm,
            background: auroraTint(aurora.status.enrich, 0.12),
            border: `1px solid ${auroraTint(aurora.status.enrich, 0.28)}`,
            color: aurora.status.enrich,
            fontFamily: aurora.font.mono,
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Select at least 1 topic
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} sx={{ color: aurora.teal }} />
          </Box>
        ) : (
          <>
            {categories.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {categories.map((category, index) => {
                  const selected = selectedCategoryIds.includes(category.id);
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Chip
                        label={category.name}
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => toggleInterest(category.id)}
                        sx={{
                          ...chipBaseSx,
                          color: selected ? aurora.tealInk : aurora.txMid,
                          borderColor: aurora.line,
                          background: selected
                            ? `linear-gradient(135deg, ${aurora.teal}, ${aurora.tealDeep})`
                            : "transparent",
                          fontWeight: selected ? 600 : 500,
                          "&:hover": {
                            borderColor: aurora.teal,
                            background: selected
                              ? `linear-gradient(135deg, ${aurora.teal}, ${aurora.tealDeep})`
                              : auroraTint(aurora.teal, 0.08),
                            transform: "translateY(-1px)",
                            filter: selected ? "brightness(1.05)" : "none",
                          },
                        }}
                      />
                    </motion.div>
                  );
                })}
              </Box>
            )}

            {customInterests.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: categories.length > 0 ? 1.5 : 0,
                }}
              >
                {customInterests.map((interest, index) => (
                  <motion.div
                    key={interest}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Chip
                      label={interest}
                      onDelete={() => removeCustomInterest(interest)}
                      sx={{
                        ...chipBaseSx,
                        color: aurora.tealInk,
                        background: `linear-gradient(135deg, ${aurora.status.enrich}, ${aurora.status.concept})`,
                        borderColor: "transparent",
                        fontWeight: 600,
                        "& .MuiChip-deleteIcon": {
                          color: auroraTint(aurora.tealInk, 0.7),
                          "&:hover": { color: aurora.tealInk },
                        },
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            )}

            <TextField
              size="small"
              placeholder="Add a custom topic..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.slice(0, 50))}
              onKeyDown={handleKeyDown}
              fullWidth
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: aurora.radii.md,
                  background: aurora.surface,
                  color: aurora.txHi,
                  fontFamily: aurora.font.ui,
                  "& fieldset": { borderColor: aurora.line },
                  "&:hover": {
                    background: aurora.surface2,
                    "& fieldset": { borderColor: aurora.line2 },
                  },
                  "&.Mui-focused": {
                    background: aurora.surface2,
                    boxShadow: `0 0 0 4px ${auroraTint(aurora.teal, 0.18)}`,
                    "& fieldset": { borderColor: aurora.teal },
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: aurora.txLow,
                  opacity: 1,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={addCustomInterest}
                      disabled={!customInput.trim()}
                      sx={{
                        color: aurora.teal,
                        "&.Mui-disabled": { color: aurora.txLow },
                      }}
                    >
                      <Plus size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}

        {data.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Box
              sx={{
                mt: 2,
                fontFamily: aurora.font.mono,
                fontSize: "11.5px",
                color: aurora.txLow,
              }}
            >
              {data.interests.length} topic
              {data.interests.length !== 1 && "s"} selected
            </Box>
          </motion.div>
        )}
      </Box>
    </OnboardingCard>
  );
}
