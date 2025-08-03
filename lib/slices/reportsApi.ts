import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Customer, Supplier } from '@/lib/types';

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
        getCustomers: builder.query<Customer[], { from: string, to: string }>({
            query: ({ from, to }) => `customers?from=${from}&to=${to}`,
            providesTags: ['CustomerReport'],
        }),
        getSuppliers: builder.query<Supplier[], { from: string, to: string }>({
            query: ({ from, to }) => `suppliers?from=${from}&to=${to}`,
            providesTags: ['SupplierReport'],
        }),
    }),
});

export const { useGetProfitLossQuery, useGetCustomersQuery, useGetSuppliersQuery } = reportsApi;
