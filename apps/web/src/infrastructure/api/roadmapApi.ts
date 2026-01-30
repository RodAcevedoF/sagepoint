import { baseApi } from './baseApi';

export interface DocumentDto {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
}

export interface GraphDataDto {
  nodes: any[];
  edges: any[];
}

export const roadmapApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentDto[], void>({
      query: () => '/documents',
      providesTags: ['Document'],
    }),
    uploadDocument: builder.mutation<DocumentDto, FormData>({
      query: (formData) => ({
        url: '/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    getGraph: builder.query<GraphDataDto, string>({
      query: (documentId) => `/roadmaps/graph/${documentId}`,
      providesTags: ['Graph'],
    }),
  }),
});

export const { useGetDocumentsQuery, useUploadDocumentMutation, useLazyGetGraphQuery } = roadmapApi;
