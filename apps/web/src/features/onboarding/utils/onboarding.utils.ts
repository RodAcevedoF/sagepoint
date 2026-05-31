import { RoadmapEventStage } from "@/shared/hooks";
import { BookOpen, Brain, CheckCircle2, GitBranch, Search } from "lucide-react";
import type { AuroraTone } from "@/shared/components/ui/Aurora/tones";

export const STAGES = [
  {
    label: "Analyzing topic",
    description: "Understanding your learning goals",
    icon: Search,
    tone: "ready" as AuroraTone,
  },
  {
    label: "Generating concepts",
    description: "Identifying key topics to cover",
    icon: Brain,
    tone: "concept" as AuroraTone,
  },
  {
    label: "Building learning path",
    description: "Ordering concepts for optimal learning",
    icon: GitBranch,
    tone: "enrich" as AuroraTone,
  },
  {
    label: "Discovering resources",
    description: "Finding the best learning materials",
    icon: BookOpen,
    tone: "proc" as AuroraTone,
  },
  {
    label: "Done!",
    description: "Your roadmap is ready",
    icon: CheckCircle2,
    tone: "teal" as AuroraTone,
  },
] as const;

export function stageToIndex(stage: RoadmapEventStage): number {
  switch (stage) {
    case "concepts":
      return 1;
    case "learning-path":
      return 2;
    case "resources":
      return 3;
    case "done":
      return 4;
    default:
      return 0;
  }
}

export const ONBOARDING_STEP_TONE: Record<string, AuroraTone> = {
  welcome: "teal",
  goal: "concept",
  experience: "ready",
  interests: "enrich",
  schedule: "proc",
  complete: "ready",
};
