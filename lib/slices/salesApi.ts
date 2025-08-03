import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Sale } from '@/lib/types/api';

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/pos/sales' }),
  tagTypes: ['Sale'],
  endpoints: (builder) => ({
    getSales: builder.query<Sale[], void>({
      query: () => '',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Sale' as const, id })), { type: 'Sale', id: 'LIST' }] : [{ type: 'Sale', id: 'LIST' }],
    }),
    getSaleById: builder.query<Sale, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sale', id }],
    }),
    createSale: builder.mutation<{ success: boolean; saleId: string; reference: string }, any>({
      query: (saleData) => ({
        url: '',
        method: 'POST',
        body: saleData,
      }),
      invalidatesTags: [{ type: 'Sale', id: 'LIST' }],
    }),
    updateSale: builder.mutation<{ success: boolean }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: '',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }, { type: 'Sale', id: 'LIST' }],
    }),
    deleteSale: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Sale', id }, { type: 'Sale', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = salesApi;