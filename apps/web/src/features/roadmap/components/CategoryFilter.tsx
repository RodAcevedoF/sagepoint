"use client";

import { Box, Chip, useTheme } from "@mui/material";
import { makeStyles } from "./CategoryFilter.styles";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  counts?: Record<string, number>;
  totalCount?: number;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  counts,
  totalCount,
}: CategoryFilterProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const isAllSelected = !selectedCategory;

  return (
    <Box sx={styles.container}>
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            All
            {totalCount != null && (
              <Box component="span" sx={styles.count(isAllSelected)}>
                {totalCount}
              </Box>
            )}
          </Box>
        }
        size="small"
        onClick={() => onSelect(null)}
        sx={styles.chip(isAllSelected)}
      />
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        const count = counts?.[cat.id];
        return (
          <Chip
            key={cat.id}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {cat.name}
                {count != null && (
                  <Box component="span" sx={styles.count(isActive)}>
                    {count}
                  </Box>
                )}
              </Box>
            }
            size="small"
            onClick={() => onSelect(cat.id)}
            sx={styles.chip(isActive)}
          />
        );
      })}
    </Box>
  );
}
