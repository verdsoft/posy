import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Quotation, QuotationItem } from '@/lib/types/quotation';

export const quotationsApi = createApi({
  reducerPath: 'quotationsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/quotations' }),
  tagTypes: ['Quotation'],
  endpoints: (builder) => ({
    getQuotations: builder.query<Quotation[], void>({
      query: () => '',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Quotation' as const, id })), { type: 'Quotation', id: 'LIST' }] : [{ type: 'Quotation', id: 'LIST' }],
    }),
    getQuotationById: builder.query<Quotation, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quotation', id }],
    }),
    createQuotation: builder.mutation<{ success: boolean; quotation_id: string; reference: string }, {
      customer_id: string;
      warehouse_id: string;
      date: string;
      valid_until?: string;
      subtotal: number;
      tax_rate: number;
      tax_amount: number;
      discount: number;
      shipping: number;
      total: number;
      status?: string;
      notes?: string;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        discount: number;
        tax: number;
        subtotal: number;
      }>;
    }>({
      query: (quotationData) => ({
        url: '',
        method: 'POST',
        body: quotationData,
      }),
      invalidatesTags: [{ type: 'Quotation', id: 'LIST' }],
    }),
    updateQuotation: builder.mutation<{ success: boolean }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: '',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quotation', id }, { type: 'Quotation', id: 'LIST' }],
    }),
    deleteQuotation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Quotation', id }, { type: 'Quotation', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
} = quotationsApi;