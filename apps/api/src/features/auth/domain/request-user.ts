/**
 * Minimal user context extracted from JWT.
 * Used in @CurrentUser() decorator - no DB call needed.
 */
export interface RequestUser {
  id: string;
  email: string;
  role: string;
}
