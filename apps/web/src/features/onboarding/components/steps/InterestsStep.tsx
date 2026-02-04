"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  alpha,
} from "@mui/material";
import { Layers, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { palette } from "@/common/theme";
import { OnboardingCard } from "../OnboardingCard";
import { useOnboarding } from "../../context/OnboardingContext";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";

// ============================================================================
// Styles
// ============================================================================

const styles = {
  chip: {
    py: 2.5,
    px: 1.5,
    borderRadius: 2,
    fontSize: "0.9rem",
    borderColor: alpha(palette.primary.light, 0.2),
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: palette.primary.light,
      background: alpha(palette.primary.light, 0.1),
      transform: "translateY(-1px)",
    },
    "&.MuiChip-filled": {
      background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.light})`,
      borderColor: "transparent",
      color: palette.background.default,
      fontWeight: 600,
    },
  },
  customChip: {
    py: 2.5,
    px: 1.5,
    borderRadius: 2,
    fontSize: "0.9rem",
    background: `linear-gradient(135deg, ${palette.secondary.main}, ${palette.secondary.light})`,
    borderColor: "transparent",
    color: palette.background.default,
    fontWeight: 600,
    "& .MuiChip-deleteIcon": {
      color: alpha(palette.background.default, 0.7),
      "&:hover": {
        color: palette.background.default,
      },
    },
  },
  hint: {
    display: "inline-block",
    px: 1.5,
    py: 0.5,
    borderRadius: 1,
    background: alpha(palette.primary.light, 0.1),
    color: palette.primary.light,
    fontSize: "0.75rem",
    mb: 2,
  },
  input: {
    mt: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: alpha(palette.primary.light, 0.05),
      "& fieldset": {
        borderColor: alpha(palette.primary.light, 0.2),
      },
      "&:hover fieldset": {
        borderColor: palette.primary.light,
      },
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export function InterestsStep() {
  const { data, updateData } = useOnboarding();
  const { data: categories = [], isLoading } = useCategoriesQuery();
  const [customInput, setCustomInput] = useState("");

  // Custom interests are prefixed with "custom:" to distinguish from category IDs
  const customInterests = data.interests
    .filter((i) => i.startsWith("custom:"))
    .map((i) => i.replace("custom:", ""));

  const selectedCategoryIds = data.interests.filter(
    (i) => !i.startsWith("custom:")
  );

  const toggleInterest = (id: string) => {
    const newInterests = data.interests.includes(id)
      ? data.interests.filter((i) => i !== id)
      : [...data.interests, id];
    updateData("interests", newInterests);
  };

  const addCustomInterest = () => {
    const trimmed = customInput.trim();
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
      data.interests.filter((i) => i !== `custom:${interest}`)
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
      icon={<Layers size={32} color={palette.primary.light} />}
      title="Select your interests"
      subtitle="Choose topics you'd like to explore. You can always change these later."
      canProceed={data.interests.length > 0}
    >
      <Box>
        <Typography component="span" sx={styles.hint}>
          Select at least 1 topic
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {categories.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Chip
                      label={category.name}
                      variant={
                        selectedCategoryIds.includes(category.id)
                          ? "filled"
                          : "outlined"
                      }
                      onClick={() => toggleInterest(category.id)}
                      sx={styles.chip}
                    />
                  </motion.div>
                ))}
              </Box>
            )}

            {/* Custom interests */}
            {customInterests.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: categories.length > 0 ? 1.5 : 0 }}>
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
                      sx={styles.customChip}
                    />
                  </motion.div>
                ))}
              </Box>
            )}

            {/* Add custom interest input */}
            <TextField
              size="small"
              placeholder="Add a custom topic..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={styles.input}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={addCustomInterest}
                      disabled={!customInput.trim()}
                      sx={{ color: palette.primary.light }}
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
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              {data.interests.length} topic{data.interests.length !== 1 && "s"}{" "}
              selected
            </Typography>
          </motion.div>
        )}
      </Box>
    </OnboardingCard>
  );
}
