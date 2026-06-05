// Queries
export { useAdminStatsQuery } from "./queries/get-admin-stats.query";
export { useAdminUsersQuery } from "./queries/get-admin-users.query";
export { useHealthCheckQuery } from "./queries/get-health-check.query";
export { useQueueStatsQuery } from "./queries/get-queue-stats.query";
export { useAdminRoadmapsQuery } from "./queries/get-admin-roadmaps.query";
export { useAdminDocumentsQuery } from "./queries/get-admin-documents.query";
export { useAdminAnalyticsQuery } from "./queries/get-admin-analytics.query";
export {
  useGetAdminInvitationsQuery,
  useGetUserLimitsQuery,
} from "@/infrastructure/api/adminApi";

// Commands
export { useUpdateAdminUserCommand } from "./commands/update-admin-user.command";
export { useDeleteAdminUserCommand } from "./commands/delete-admin-user.command";
export { useUpdateUserLimitsCommand } from "./commands/update-user-limits.command";
export { useDeleteAdminRoadmapCommand } from "./commands/delete-admin-roadmap.command";
export { useToggleRoadmapFeaturedCommand } from "./commands/toggle-roadmap-featured.command";
export { useDeleteAdminDocumentCommand } from "./commands/delete-admin-document.command";
export { useCreateInvitationCommand } from "./commands/create-invitation.command";
export { useRevokeInvitationCommand } from "./commands/revoke-invitation.command";
export { useCreateUserDirectCommand } from "./commands/create-user-direct.command";
