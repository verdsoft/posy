import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Purchase, PurchaseItem } from '@/lib/types/purchase';

export const purchasesApi = createApi({
  reducerPath: 'purchasesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/purchases' }),
  tagTypes: ['Purchase'],
  endpoints: (builder) => ({
    getPurchases: builder.query<Purchase[], void>({
      query: () => '',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Purchase' as const, id })), { type: 'Purchase', id: 'LIST' }] : [{ type: 'Purchase', id: 'LIST' }],
    }),
    getPurchaseById: builder.query<Purchase, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Purchase', id }],
    }),
    createPurchase: builder.mutation<{ success: boolean; purchase_id: string; reference: string }, {
      supplier_id: string;
      warehouse_id: string;
      date: string;
      subtotal: number;
      tax_rate: number;
      tax_amount: number;
      discount: number;
      shipping: number;
      total: number;
      status?: string;
      payment_status?: string;
      notes?: string;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_cost: number;
        discount: number;
        tax: number;
        subtotal: number;
      }>;
    }>({
      query: (purchaseData) => ({
        url: '',
        method: 'POST',
        body: purchaseData,
      }),
      invalidatesTags: [{ type: 'Purchase', id: 'LIST' }],
    }),
    updatePurchase: builder.mutation<{ success: boolean }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: '',
        method: 'PUT',
        body: { id, ...data },
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