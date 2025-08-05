import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Purchase, PurchaseItem, PaginatedPurchasesResponse } from '@/lib/types/purchase';

export const purchasesApi = createApi({
  reducerPath: 'purchasesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/purchases' }),
  tagTypes: ['Purchase'],
  endpoints: (builder) => ({
    getPurchases: builder.query<PaginatedPurchasesResponse, { page: number; limit: number; search: string }>({
        query: ({ page, limit, search }) => `?page=${page}&limit=${limit}&search=${search}`,
        providesTags: (result) =>
            result
                ? [
                    ...result.data.map(({ id }) => ({ type: 'Purchase' as const, id })),
                    { type: 'Purchase', id: 'LIST' },
                ]
                : [{ type: 'Purchase', id: 'LIST' }],
    }),
    getPurchaseById: builder.query<Purchase, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }],
    }),
    createPurchase: builder.mutation<{ success: boolean; purchase_id: string; reference: string }, any>({
      query: (purchaseData) => ({
        url: '',
        method: 'POST',
        body: purchaseData,
      }),
      invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],
    }),
    updatePurchase: builder.mutation<{ success: boolean }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Purchase', id }, { type: 'Purchase', id: 'LIST' }],
    }),
    deletePurchase: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Purchase', id }, { type: 'Purchase', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchasesApi;