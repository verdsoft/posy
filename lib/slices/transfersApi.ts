import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Transfer,
  CreateTransferInput,
  UpdateTransferInput,
  PaginatedResponse,
  SearchParams
} from '@/lib/types/prisma';

export const transfersApi = createApi({
  reducerPath: 'transfersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/transfers' }),
  tagTypes: ['Transfer'],
  endpoints: (builder) => ({
    getTransfers: builder.query<PaginatedResponse<Transfer>, SearchParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        // Add other filters as needed
        return `?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Transfer' as const, id })),
            { type: 'Transfer', id: 'LIST' },
          ]
          : [{ type: 'Transfer', id: 'LIST' }],
    }),
    getTransferById: builder.query<Transfer, number | string>({
      query: (id) => `?id=${id}`,
      providesTags: (result, error, id) => [{ type: 'Transfer', id }],
    }),
    createTransfer: builder.mutation<Transfer, CreateTransferInput>({
      query: (transferData) => ({
        url: '',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: [{ type: 'Transfer', id: 'LIST' }],
    }),
    updateTransfer: builder.mutation<Transfer, { id: number | string; data: UpdateTransferInput }>({
      query: ({ id, data }) => ({
        url: `?id=${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transfer', id }, { type: 'Transfer', id: 'LIST' }],
    }),
    deleteTransfer: builder.mutation<{ success: boolean; message: string }, number | string>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Transfer', id }, { type: 'Transfer', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useGetTransferByIdQuery,
  useCreateTransferMutation,
  useUpdateTransferMutation,
  useDeleteTransferMutation,
} = transfersApi;
