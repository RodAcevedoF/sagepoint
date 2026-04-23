"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { Tag, Check } from "lucide-react";
import { useCategoriesQuery } from "@/application/onboarding/queries/get-categories.query";
import { useUpdateRoadmapCategoryCommand } from "@/application/roadmap";
import { useSnackbar } from "@/shared/components";

interface CategorySelectorProps {
  roadmapId: string;
  currentCategoryId?: string | null;
  editable: boolean;
}

export function CategorySelector({
  roadmapId,
  currentCategoryId,
  editable,
}: CategorySelectorProps) {
  const theme = useTheme();
  const { data: categories } = useCategoriesQuery();
  const { execute: updateCategory, isLoading } =
    useUpdateRoadmapCategoryCommand();
  const { showSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const current = categories?.find((c) => c.id === currentCategoryId);
  const label = current?.name ?? "Uncategorized";

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    if (!editable) return;
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = async (categoryId: string | null) => {
    handleClose();
    if (categoryId === (currentCategoryId ?? null)) return;
    const result = await updateCategory(roadmapId, categoryId);
    if (result.ok) {
      showSnackbar("Category updated", { severity: "success" });
    } else {
      showSnackbar("Failed to update category", { severity: "error" });
    }
  };

  const chipSx = {
    fontWeight: 600,
    bgcolor: current
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.text.secondary, 0.08),
    color: current ? theme.palette.primary.light : theme.palette.text.secondary,
    border: `1px solid ${alpha(current ? theme.palette.primary.main : theme.palette.text.secondary, 0.2)}`,
    cursor: editable ? "pointer" : "default",
    "&:hover": editable
      ? {
          bgcolor: alpha(theme.palette.primary.main, 0.15),
        }
      : undefined,
  };

  return (
    <>
      <Chip
        size="small"
        icon={
          isLoading ? (
            <CircularProgress size={12} sx={{ color: "inherit" }} />
          ) : (
            <Tag size={14} />
          )
        }
        label={label}
        onClick={editable ? handleOpen : undefined}
        sx={chipSx}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{ paper: { sx: { maxHeight: 360, minWidth: 220 } } }}
      >
        <MenuItem onClick={() => handleSelect(null)} dense>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Uncategorized
            </Typography>
            {!currentCategoryId && <Check size={14} />}
          </Box>
        </MenuItem>
        {categories?.map((cat) => (
          <MenuItem key={cat.id} onClick={() => handleSelect(cat.id)} dense>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: 2,
              }}
            >
              <Typography variant="body2">{cat.name}</Typography>
              {cat.id === currentCategoryId && <Check size={14} />}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
