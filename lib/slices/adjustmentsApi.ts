import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Adjustment, AdjustmentDetails, PaginatedAdjustmentResponse } from '@/lib/types/adjustment';

export const adjustmentsApi = createApi({
  reducerPath: 'adjustmentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/adjustments' }),
  tagTypes: ['Adjustment'],
  endpoints: (builder) => ({
    getAdjustments: builder.query<PaginatedAdjustmentResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page) search.append('page', params.page.toString());
        if (params?.limit) search.append('limit', params.limit.toString());
        if (params?.search) search.append('search', params.search);
        return `?${search.toString()}`;
      },
      providesTags: (result) =>
        result?.data ? [...result.data.map(({ id }) => ({ type: 'Adjustment' as const, id })), { type: 'Adjustment', id: 'LIST' }] : [{ type: 'Adjustment', id: 'LIST' }],
    }),
    getAdjustmentById: builder.query<AdjustmentDetails, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Adjustment', id }],
    }),
    createAdjustment: builder.mutation<{ success: boolean; adjustment_id: string; reference: string }, {
      warehouse_id: string;
      date: string;
      items: Array<{
        product_id: string;
        quantity: number;
        type: 'addition' | 'subtraction';
      }>;
      notes?: string;
    }>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Adjustment', id: 'LIST' }],
    }),
    updateAdjustment: builder.mutation<{ success: boolean }, { id: string; body: {
      warehouse_id: string;
      date: string;
      type: 'addition' | 'subtraction';
      items: Array<{ product_id: string; quantity: number; type: 'addition' | 'subtraction' }>;
      notes?: string;
    }}>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Adjustment', id }, { type: 'Adjustment', id: 'LIST' }],
    }),
    deleteAdjustment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Adjustment', id }, { type: 'Adjustment', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdjustmentsQuery,
  useGetAdjustmentByIdQuery,
  useCreateAdjustmentMutation,
  useUpdateAdjustmentMutation,
  useDeleteAdjustmentMutation,
} = adjustmentsApi;