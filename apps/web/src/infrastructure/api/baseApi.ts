import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
});

/**
 * Custom baseQuery with automatic token refresh on 401 errors.
 *
 * Flow:
 * 1. Make request with access_token cookie
 * 2. If 401, call /auth/refresh (uses refresh_token cookie)
 * 3. If refresh succeeds, retry original request
 * 4. If refresh fails, reject (triggers logout via authSlice)
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Refresh succeeded - retry the original request
      result = await baseQuery(args, api, extraOptions);
    }
    // If refresh failed, the 401 error will propagate and
    // authSlice.matchRejected will set isAuthenticated = false
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Document', 'DocumentSummary', 'Quiz', 'QuizAttempt', 'Graph', 'Category', 'Roadmap', 'RoadmapProgress', 'Resource', 'AdminStats'],
  endpoints: () => ({}),
});
