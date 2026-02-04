import { User, UserRole } from '@sagepoint/domain';
export const USER_SERVICE = Symbol('USER_SERVICE');

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
  passwordHash?: string;
}

export interface OnboardingInput {
  learningGoal?: string;
  experienceLevel?: string;
  interests: string[];
  weeklyHoursGoal?: number;
  status: 'COMPLETED' | 'SKIPPED' | 'PENDING';
}

export interface UpdateProfileInput {
  name?: string;
  learningGoal?: string;
  avatarUrl?: string;
}

export interface IUserService {
  create(input: CreateUserInput): Promise<User>;
  save(user: User): Promise<void>;
  get(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByGoogleId(googleId: string): Promise<User | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<User>;
  completeOnboarding(userId: string, input: OnboardingInput): Promise<void>;
}
