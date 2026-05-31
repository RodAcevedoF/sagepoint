import type { ReactNode } from "react";
import { Pill } from "@/shared/components";
import type { AuroraTone } from "@/shared/components";

interface OverviewChipProps {
  count: number;
  label: string;
  icon: ReactNode;
  tone: AuroraTone;
}

export function OverviewChip({ count, label, icon, tone }: OverviewChipProps) {
  if (count === 0) return null;
  return (
    <Pill tone={tone} icon={icon}>
      {count} {label}
    </Pill>
  );
}
