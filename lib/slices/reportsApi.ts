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

export interface BestCustomer {
    id: number;
    name: string;
    email: string;
    phone: string;
    sales_count: number;
    total_sales: number;
    total_paid: number;
    total_due: number;
}

export interface TopSellingProduct {
    product_id: number;
    name: string;
    code: string;
    total_quantity: number;
    total_sales: number;
}

export interface QuantityAlertProduct {
    id: number;
    name: string;
    code: string;
    stock: number;
    price: number;
    cost: number;
    alert_quantity: number;
    category_name: string;
    brand_name: string;
    unit_name: string;
}

export interface WarehouseReport {
    id: number;
    name: string;
    location: string;
    product_count: number;
    total_stock_value: number;
}

export const reportsApi = createApi({
    reducerPath: 'reportsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/reports' }),
    tagTypes: ['Report', 'CustomerReport', 'SupplierReport', 'SalesReport', 'PurchasesReport', 'PaymentReport', 'WarehouseReport'],
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
        getSalesReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `sales?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['SalesReport'],
        }),
        getPurchasesReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `purchases?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['PurchasesReport'],
        }),
        getSalesReturnsReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `sales-returns-report?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['Report'],
        }),
        getPurchaseReturnsReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `purchase-returns-report?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['Report'],
        }),
        getBestCustomers: builder.query<{ data: BestCustomer[] }, { from: string; to: string; limit?: number }>({
            query: ({ from, to, limit = 10 }) => `best-customers?from=${from}&to=${to}&limit=${limit}`,
            providesTags: ['CustomerReport'],
        }),
        getTopSellingProducts: builder.query<{ data: TopSellingProduct[] }, { from: string; to: string; limit?: number }>({
            query: ({ from, to, limit = 10 }) => `top-selling?from=${from}&to=${to}&limit=${limit}`,
            providesTags: ['Report'],
        }),
        getQuantityAlerts: builder.query<PaginatedResponse<QuantityAlertProduct>, { threshold?: number; page?: number; limit?: number }>({
            query: ({ threshold = 10, page = 1, limit = 100 }) => `quantity-alerts?threshold=${threshold}&page=${page}&limit=${limit}`,
            providesTags: ['Report'],
        }),
        getWarehouseReport: builder.query<PaginatedResponse<WarehouseReport>, { page?: number; limit?: number }>({
            query: ({ page = 1, limit = 100 }) => `warehouse?page=${page}&limit=${limit}`,
            providesTags: ['WarehouseReport'],
        }),
        getSalesPaymentsReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `payments/sales?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['PaymentReport'],
        }),
        getPurchasesPaymentsReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `payments/purchases?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['PaymentReport'],
        }),
        getSalesReturnsPaymentsReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `payments/sales-returns?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['PaymentReport'],
        }),
        getPurchaseReturnsPaymentsReport: builder.query<PaginatedResponse<any>, { from: string; to: string; page?: number; limit?: number }>({
            query: ({ from, to, page = 1, limit = 100 }) => `payments/purchase-returns?from=${from}&to=${to}&page=${page}&limit=${limit}`,
            providesTags: ['PaymentReport'],
        }),
    }),
});

export const {
    useGetProfitLossQuery,
    useGetCustomersQuery,
    useGetSuppliersQuery,
    useGetSalesReportQuery,
    useGetPurchasesReportQuery,
    useGetSalesReturnsReportQuery,
    useGetPurchaseReturnsReportQuery,
    useGetBestCustomersQuery,
    useGetTopSellingProductsQuery,
    useGetQuantityAlertsQuery,
    useGetWarehouseReportQuery,
    useGetSalesPaymentsReportQuery,
    useGetPurchasesPaymentsReportQuery,
    useGetSalesReturnsPaymentsReportQuery,
    useGetPurchaseReturnsPaymentsReportQuery,
} = reportsApi;
