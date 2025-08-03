import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PaginatedResponse } from '../types';

export interface Payment {
    id: string;
    date: string;
    reference: string;
    amount: number;
    payment_method: string;
    sale_id?: string;
    purchase_id?: string;
    sale_return_id?: string;
    purchase_return_id?: string;
    customer_name?: string;
    supplier_name?: string;
    notes?: string;
}

export interface PaginatedPaymentsResponse extends PaginatedResponse<Payment> {}

export const paymentsApi = createApi({
    reducerPath: 'paymentsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/payments' }),
    tagTypes: ['Payment'],
    endpoints: (builder) => ({
        getSalesPayments: builder.query<PaginatedPaymentsResponse, { from: string; to: string; page: number; limit: number; searchTerm: string }>({
            query: ({ from, to, page, limit, searchTerm }) => `sales?from=${from}&to=${to}&page=${page}&limit=${limit}&search=${searchTerm}`,
            providesTags: (result) =>
                result
                    ? [...result.data.map(({ id }) => ({ type: 'Payment' as const, id })), { type: 'Payment', id: 'LIST' }]
                    : [{ type: 'Payment', id: 'LIST' }],
        }),
        getPurchasePayments: builder.query<PaginatedPaymentsResponse, { from: string; to: string; page: number; limit: number; searchTerm: string }>({
            query: ({ from, to, page, limit, searchTerm }) => `purchases?from=${from}&to=${to}&page=${page}&limit=${limit}&search=${searchTerm}`,
            providesTags: (result) =>
                result
                    ? [...result.data.map(({ id }) => ({ type: 'Payment' as const, id })), { type: 'Payment', id: 'LIST' }]
                    : [{ type: 'Payment', id: 'LIST' }],
        }),
        getSalesReturnPayments: builder.query<PaginatedPaymentsResponse, { from: string; to: string; page: number; limit: number; searchTerm: string }>({
            query: ({ from, to, page, limit, searchTerm }) => `sales-returns?from=${from}&to=${to}&page=${page}&limit=${limit}&search=${searchTerm}`,
            providesTags: (result) =>
                result
                    ? [...result.data.map(({ id }) => ({ type: 'Payment' as const, id })), { type: 'Payment', id: 'LIST' }]
                    : [{ type: 'Payment', id: 'LIST' }],
        }),
        getPurchaseReturnPayments: builder.query<PaginatedPaymentsResponse, { from: string; to: string; page: number; limit: number; searchTerm: string }>({
            query: ({ from, to, page, limit, searchTerm }) => `purchase-returns?from=${from}&to=${to}&page=${page}&limit=${limit}&search=${searchTerm}`,
            providesTags: (result) =>
                result
                    ? [...result.data.map(({ id }) => ({ type: 'Payment' as const, id })), { type: 'Payment', id: 'LIST' }]
                    : [{ type: 'Payment', id: 'LIST' }],
        }),
    }),
});

export const { 
    useGetSalesPaymentsQuery, 
    useGetPurchasePaymentsQuery, 
    useGetSalesReturnPaymentsQuery, 
    useGetPurchaseReturnPaymentsQuery 
} = paymentsApi;
