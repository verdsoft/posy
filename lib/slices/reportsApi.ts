import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Customer, Supplier, PaginatedResponse } from '@/lib/types';

export interface ProfitLossData {
    sales: { count: number; total: number };
    purchases: { count: number; total: number };
    salesReturns: { count: number; total: number };
    purchaseReturns: { count: number; total: number };
    expenses: { total: number };
    payments: { received: number; sent: number };
    profit: number;
    paymentsNet: number;
}

export const reportsApi = createApi({
    reducerPath: 'reportsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/reports' }),
    tagTypes: ['Report', 'CustomerReport', 'SupplierReport'],
    endpoints: (builder) => ({
        getProfitLoss: builder.query<ProfitLossData, { from: string; to: string }>({
            query: ({ from, to }) => `profit-loss?from=${from}&to=${to}`,
            providesTags: ['Report'],
        }),
        getCustomers: builder.query<PaginatedResponse<Customer>, { from: string, to: string }>({
            query: ({ from, to }) => `customers?from=${from}&to=${to}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'CustomerReport' as const, id })),
                        { type: 'CustomerReport', id: 'LIST' },
                    ]
                    : [{ type: 'CustomerReport', id: 'LIST' }],
        }),
        getSuppliers: builder.query<PaginatedResponse<Supplier>, { from: string, to: string }>({
            query: ({ from, to }) => `suppliers?from=${from}&to=${to}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'SupplierReport' as const, id })),
                        { type: 'SupplierReport', id: 'LIST' },
                    ]
                    : [{ type: 'SupplierReport', id: 'LIST' }],
        }),
    }),
});

export const { useGetProfitLossQuery, useGetCustomersQuery, useGetSuppliersQuery } = reportsApi;
