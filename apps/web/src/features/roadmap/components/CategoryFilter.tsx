"use client";

import { useMemo } from "react";
import { FilterChips, type FilterChipOption } from "@/common/components";

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
  const options: FilterChipOption[] = useMemo(
    () => [
      { label: "All", value: "__all__", count: totalCount },
      ...categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
        count: counts?.[cat.id],
      })),
    ],
    [categories, counts, totalCount],
  );

  return (
    <FilterChips
      options={options}
      value={selectedCategory ?? "__all__"}
      onChange={(v) => onSelect(v === "__all__" ? null : v)}
    />
  );
}
