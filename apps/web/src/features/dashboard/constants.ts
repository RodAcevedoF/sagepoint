import { palette } from "@/shared/theme";

export interface ItemColor {
  main: string;
  light: string;
}

// Order matters: first roadmap gets the first color. Primary teal sits later
// in the rotation so the dashboard doesn't open with the same hue as the
// rest of the brand chrome.
export const ITEM_COLORS: ItemColor[] = [
  { main: palette.purple.main, light: palette.purple.light },
  { main: palette.warning.main, light: palette.warning.light },
  { main: palette.info.main, light: palette.info.light },
  { main: palette.success.main, light: palette.success.light },
  { main: palette.primary.main, light: palette.primary.light },
];

export const pickItemColor = (index: number): ItemColor =>
  ITEM_COLORS[index % ITEM_COLORS.length];
