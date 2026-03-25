// Queries
export { useAdminStatsQuery } from "./queries/get-admin-stats.query";
export { useAdminUsersQuery } from "./queries/get-admin-users.query";
export { useHealthCheckQuery } from "./queries/get-health-check.query";
export { useQueueStatsQuery } from "./queries/get-queue-stats.query";
export { useAdminRoadmapsQuery } from "./queries/get-admin-roadmaps.query";
export { useAdminDocumentsQuery } from "./queries/get-admin-documents.query";
export { useAdminAnalyticsQuery } from "./queries/get-admin-analytics.query";

// Mutations
export { useUpdateAdminUserMutation } from "@/infrastructure/api/adminApi";
export { useDeleteAdminRoadmapMutation } from "@/infrastructure/api/adminApi";
export { useToggleRoadmapFeaturedMutation } from "@/infrastructure/api/adminApi";
export { useDeleteAdminDocumentMutation } from "@/infrastructure/api/adminApi";
export {
  useGetAdminInvitationsQuery,
  useCreateInvitationMutation,
  useRevokeInvitationMutation,
  useCreateUserDirectMutation,
} from "@/infrastructure/api/adminApi";
