import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create the primary base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['User', 'Document', 'Graph', 'Category', 'Roadmap'], // Define common tags here
  endpoints: () => ({}), // Endpoints will be injected from specific features
});
