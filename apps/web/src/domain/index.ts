/**
 * Frontend domain barrel.
 * Re-exports shared domain types from @sagepoint/domain
 * and defines frontend-specific type aliases.
 */
export {
  User,
  UserRole,
  Category,
  Document,
  DocumentStatus,
  Roadmap,
  Concept,
  type RegisterInput,
  type LoginResult,
  type TokenPayload,
  type RequestUser,
} from '@sagepoint/domain';
