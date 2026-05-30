import { ReviewSource } from "@sagepoint/domain";
import { baseApi } from "./baseApi";

export interface ReviewQueueOptionDto {
  label: string;
  text: string;
}

export interface ReviewQueueQuestionDto {
  id: string;
  text: string;
  type: string;
  options: ReviewQueueOptionDto[];
  difficulty: string;
}

export interface ReviewQueueItemDto {
  cardId: string;
  source: ReviewSource;
  sourceId: string;
  dueAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  question: ReviewQueueQuestionDto;
}

export interface ReviewCountDto {
  count: number;
}

export interface ReviewCardDto {
  id: string;
  userId: string;
  source: ReviewSource;
  sourceId: string;
  questionId: string;
  dueAt: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewScope {
  source?: ReviewSource;
  sourceId?: string;
}

export interface GetReviewQueueArgs extends ReviewScope {
  limit?: number;
}

export interface GradeReviewArgs {
  cardId: string;
  quality: number;
  scope?: ReviewScope;
}

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewQueue: builder.query<
      ReviewQueueItemDto[],
      GetReviewQueueArgs | void
    >({
      query: (args) => ({
        url: "/review/due",
        params: args || undefined,
      }),
      providesTags: (_result, _error, args) => [
        { type: "Review", id: scopeId(args) },
      ],
    }),
    getReviewCount: builder.query<ReviewCountDto, ReviewScope | void>({
      query: (args) => ({
        url: "/review/due/count",
        params: args || undefined,
      }),
      providesTags: (_result, _error, args) => [
        { type: "ReviewCount", id: scopeId(args) },
      ],
    }),
    gradeReview: builder.mutation<ReviewCardDto, GradeReviewArgs>({
      query: ({ cardId, quality }) => ({
        url: `/review/cards/${cardId}/grade`,
        method: "POST",
        body: { quality },
      }),
      invalidatesTags: (_result, _error, { scope }) => [
        { type: "Review", id: scopeId(scope) },
        { type: "Review", id: scopeId(undefined) },
        { type: "ReviewCount", id: scopeId(scope) },
        { type: "ReviewCount", id: scopeId(undefined) },
      ],
    }),
  }),
});

function scopeId(scope: ReviewScope | void | undefined): string {
  if (!scope || (!scope.source && !scope.sourceId)) return "ALL";
  return `${scope.source ?? ""}:${scope.sourceId ?? ""}`;
}

export const {
  useGetReviewQueueQuery,
  useGetReviewCountQuery,
  useGradeReviewMutation,
} = reviewApi;
