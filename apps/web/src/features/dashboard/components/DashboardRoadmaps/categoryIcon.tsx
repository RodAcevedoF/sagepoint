import { Layers, Hash, BookOpen, Zap, Compass } from "lucide-react";
import { palette } from "@/shared/theme";
import type { ItemColor } from "../../constants";

export const ROADMAP_ITEM_COLORS: ItemColor[] = [
  { main: palette.info.main, light: palette.info.light },
  { main: palette.success.main, light: palette.success.light },
  { main: palette.warning.main, light: palette.warning.light },
  { main: palette.primary.main, light: palette.primary.light },
];

export const pickRoadmapColor = (index: number): ItemColor =>
  ROADMAP_ITEM_COLORS[index % ROADMAP_ITEM_COLORS.length];

export function renderCategoryIcon(index: number) {
  switch (index % 5) {
    case 0:
      return <Hash size={18} strokeWidth={2.2} />;
    case 1:
      return <BookOpen size={18} strokeWidth={2.2} />;
    case 2:
      return <Compass size={18} strokeWidth={2.2} />;
    case 3:
      return <Zap size={18} strokeWidth={2.2} />;
    default:
      return <Layers size={18} strokeWidth={2.2} />;
  }
}
