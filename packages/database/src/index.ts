export * from "./generated/prisma/client";
export { PrismaPg } from "@prisma/adapter-pg";

// Shared repository adapters
export { PrismaCategoryRepository } from "./repositories/prisma-category.repository";
export { PrismaNewsArticleRepository } from "./repositories/prisma-news-article.repository";
export { PrismaUserRepository } from "./repositories/prisma-user.repository";
export { PrismaDocumentRepository } from "./repositories/prisma-document.repository";
export { PrismaDocumentSummaryRepository } from "./repositories/prisma-document-summary.repository";
export { PrismaQuizRepository } from "./repositories/prisma-quiz.repository";
export { PrismaQuestionRepository } from "./repositories/prisma-question.repository";
export { PrismaQuizAttemptRepository } from "./repositories/prisma-quiz-attempt.repository";
export { PrismaInvitationRepository } from "./repositories/prisma-invitation.repository";
export { PrismaRoadmapRepository } from "./repositories/prisma-roadmap.repository";
export { PrismaProgressRepository } from "./repositories/prisma-progress.repository";
export { PrismaResourceRepository } from "./repositories/prisma-resource.repository";
export { PrismaStepQuizAttemptRepository } from "./repositories/prisma-step-quiz-attempt.repository";
