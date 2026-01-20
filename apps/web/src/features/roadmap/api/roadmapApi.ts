import { baseApi } from '@/common/api/baseApi';

export interface Document {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
}

export interface GraphData {
  nodes: any[];
  edges: any[];
}

export const roadmapApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<Document[], void>({
      query: () => '/documents',
      providesTags: ['Document'],
    }),
    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: '/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    getGraph: builder.query<GraphData, string>({
      query: (documentId) => `/roadmaps/graph/${documentId}`,
      providesTags: ['Graph'],
    }),
  }),
});

export const { useGetDocumentsQuery, useUploadDocumentMutation, useLazyGetGraphQuery } = roadmapApi;
