import type {
  UserMetrics,
  ProgressData,
  RecentActivity,
  NewsItem,
  TopicDistribution,
} from "../types/dashboard.types";

// ============================================================================
// Mock Data
// ============================================================================

export const mockUserMetrics: UserMetrics = {
  totalHoursLearned: 47,
  topicsCompleted: 12,
  currentStreak: 5,
  weeklyProgress: 68,
};

export const mockProgressData: ProgressData[] = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2.0 },
  { day: "Wed", hours: 0.5 },
  { day: "Thu", hours: 3.0 },
  { day: "Fri", hours: 2.5 },
  { day: "Sat", hours: 1.0 },
  { day: "Sun", hours: 0 },
];

export const mockRecentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "topic",
    title: "React Server Components",
    category: "Frontend",
    timestamp: "2 hours ago",
    progress: 75,
  },
  {
    id: "2",
    type: "resource",
    title: "Clean Architecture in TypeScript",
    category: "Architecture",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    type: "topic",
    title: "Docker Fundamentals",
    category: "DevOps",
    timestamp: "2 days ago",
    progress: 100,
  },
];

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "Next.js 15 introduces Partial Prerendering",
    source: "Vercel Blog",
    category: "Frontend",
    timestamp: "3 hours ago",
    url: "#",
  },
  {
    id: "2",
    title: "TypeScript 5.4 brings NoInfer utility type",
    source: "Microsoft DevBlog",
    category: "TypeScript",
    timestamp: "1 day ago",
    url: "#",
  },
  {
    id: "3",
    title: "The rise of Edge Computing in 2024",
    source: "TechCrunch",
    category: "Cloud",
    timestamp: "2 days ago",
    url: "#",
  },
];

export const mockTopicDistribution: TopicDistribution[] = [
  { name: "Frontend", value: 35, color: "#35A29F" },
  { name: "Backend", value: 25, color: "#0B666A" },
  { name: "DevOps", value: 20, color: "#97FEED" },
  { name: "Architecture", value: 15, color: "#071952" },
  { name: "Other", value: 5, color: "#4a5568" },
];
