export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface AdminUserView {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  onboardingStatus: string;
}

export interface AdminRoadmapView {
  id: string;
  title: string;
  generationStatus: string;
  isFeatured: boolean;
  visibility: string;
  createdAt: Date;
  user: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
}

export interface AdminDocumentView {
  id: string;
  filename: string;
  status: string;
  processingStage: string;
  fileSize: number | null;
  createdAt: Date;
  user: { id: string; name: string; email: string };
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IAdminRepository {
  // Stats
  countUsers(): Promise<number>;
  countDocuments(): Promise<number>;
  countRoadmaps(): Promise<number>;
  countQuizzes(): Promise<number>;
  getDocumentCountsByStage(): Promise<Record<string, number>>;

  // Users
  findAllUsers(): Promise<AdminUserView[]>;
  findUserById(id: string): Promise<AdminUserView | null>;
  updateUser(
    id: string,
    data: { role?: string; isActive?: boolean },
  ): Promise<AdminUserView>;
  deleteUser(id: string): Promise<void>;

  // Roadmaps
  findRoadmaps(query: {
    status?: string;
    categoryId?: string;
    skip: number;
    take: number;
  }): Promise<{ data: AdminRoadmapView[]; total: number }>;
  findRoadmapById(
    id: string,
  ): Promise<{ id: string; isFeatured: boolean } | null>;
  deleteRoadmap(id: string): Promise<void>;
  updateRoadmapFeatured(
    id: string,
    isFeatured: boolean,
  ): Promise<{ id: string; isFeatured: boolean }>;

  // Documents
  findDocuments(query: {
    stage?: string;
    status?: string;
    skip: number;
    take: number;
  }): Promise<{ data: AdminDocumentView[]; total: number }>;
  documentExists(id: string): Promise<boolean>;
  deleteDocument(id: string): Promise<void>;

  // Analytics
  getSignupsByDay(since: Date): Promise<DailyCount[]>;
  getUploadsByDay(since: Date): Promise<DailyCount[]>;
  getGenerationsByDay(since: Date): Promise<DailyCount[]>;
}
