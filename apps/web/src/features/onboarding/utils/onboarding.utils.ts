import { RoadmapEventStage } from "@/shared/hooks";
import { Theme } from "@mui/material";
import { BookOpen, Brain, CheckCircle2, GitBranch, Search } from "lucide-react";

export const STAGES = [
  {
    label: "Analyzing topic",
    description: "Understanding your learning goals",
    icon: Search,
    color: (t: Theme) => t.palette.success.main,
  },
  {
    label: "Generating concepts",
    description: "Identifying key topics to cover",
    icon: Brain,
    color: (t: Theme) => t.palette.info.light,
  },
  {
    label: "Building learning path",
    description: "Ordering concepts for optimal learning",
    icon: GitBranch,
    color: (t: Theme) => t.palette.purple.light,
  },
  {
    label: "Discovering resources",
    description: "Finding the best learning materials",
    icon: BookOpen,
    color: (t: Theme) => t.palette.warning.light,
  },
  {
    label: "Done!",
    description: "Your roadmap is ready",
    icon: CheckCircle2,
    color: (t: Theme) => t.palette.accent,
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
