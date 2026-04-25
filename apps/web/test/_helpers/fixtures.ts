import type { UserRoadmapDto } from "@/infrastructure/api/roadmapApi";
import type { DocumentDetailDto } from "@/infrastructure/api/documentApi";
import { RoadmapVisibility } from "@sagepoint/domain";

export const mockUser = {
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  role: "USER",
  onboardingStatus: "COMPLETED",
  avatarUrl: null,
  learningGoal: null,
  interests: [],
};

export function makeUserRoadmap(
  overrides: Partial<{
    id: string;
    title: string;
    description: string;
    progress: number;
    completed: number;
    total: number;
    status: string;
    visibility: RoadmapVisibility;
    createdAt: string;
  }> = {},
): UserRoadmapDto {
  const id = overrides.id ?? "r1";
  const total = overrides.total ?? 5;
  const completed = overrides.completed ?? 2;
  return {
    roadmap: {
      id,
      title: overrides.title ?? "Test Roadmap",
      description: overrides.description ?? "A test roadmap",
      steps: Array.from({ length: total }, (_, i) => ({
        concept: { id: `c${i}`, name: `Concept ${i}`, description: "" },
        order: i,
        dependsOn: [],
        estimatedDuration: 30,
        difficulty: "beginner" as const,
      })),
      generationStatus: (overrides.status ?? "completed") as "completed",
      totalEstimatedDuration: total * 30,
      recommendedPace: "2 hours/day",
      visibility:
        (overrides.visibility as RoadmapVisibility) ??
        RoadmapVisibility.PRIVATE,
      createdAt: overrides.createdAt ?? "2026-03-15T10:00:00Z",
    },
    progress: {
      roadmapId: id,
      totalSteps: total,
      completedSteps: completed,
      inProgressSteps: 1,
      skippedSteps: 0,
      progressPercentage: Math.round((completed / total) * 100),
      lastActivityAt: null,
    },
  };
}

export function makeDocument(
  overrides: Partial<DocumentDetailDto> = {},
): DocumentDetailDto {
  return {
    id: "d1",
    filename: "test-document.pdf",
    status: "COMPLETED",
    storagePath: "/files/test.pdf",
    userId: "u1",
    processingStage: "READY" as never,
    mimeType: "application/pdf",
    fileSize: 1024000,
    conceptCount: 12,
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
    ...overrides,
  };
}
