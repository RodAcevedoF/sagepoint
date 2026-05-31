import { Pill } from "@/shared/components";
import { aurora } from "@/shared/theme";

interface StatusChipProps {
  label: string;
  colorMap: Record<string, string>;
}

export function StatusChip({ label, colorMap }: StatusChipProps) {
  const accent = colorMap[label] ?? aurora.txMid;
  return <Pill accent={accent}>{label}</Pill>;
}
