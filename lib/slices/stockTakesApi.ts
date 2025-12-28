import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface StockTake {
    id: number
    reference: string
    warehouse_id: number
    warehouse_name?: string
    date: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    notes?: string
    created_by: number
    created_by_name?: string
    created_at: string
    updated_at?: string
    finalized_at?: string
    items_count?: number
    stock_take_items?: StockTakeItem[]
    warehouses?: any
    users?: any
}

export interface StockTakeItem {
    id: number
    stock_take_id: number
    product_id: number
    expected_qty: number
    counted_qty?: number
    variance?: number
    notes?: string
    products?: any
}

export const stockTakesApi = createApi({
    reducerPath: "stockTakesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/v2",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token")
            const userId = localStorage.getItem("userId")
            if (token) headers.set("Authorization", `Bearer ${token}`)
            if (userId) headers.set("x-user-id", userId)
            return headers
        },
    }),
    tagTypes: ["StockTakes"],
    endpoints: (builder) => ({
        getStockTakes: builder.query({
            query: ({ page = 1, limit = 10, warehouse_id, status, search }) => {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                })
                if (warehouse_id) params.append("warehouse_id", warehouse_id)
                if (status) params.append("status", status)
                if (search) params.append("search", search)
                return `/stock-takes?${params.toString()}`
            },
            providesTags: ["StockTakes"],
        }),
        getStockTake: builder.query({
            query: (id) => `/stock-takes?id=${id}`,
            providesTags: (_result, _error, id) => [{ type: "StockTakes", id }],
        }),
        createStockTake: builder.mutation({
            query: (body) => ({
                url: "/stock-takes",
                method: "POST",
                body,
            }),
            invalidatesTags: ["StockTakes"],
        }),
        updateStockTake: builder.mutation({
            query: (body) => ({
                url: "/stock-takes",
                method: "PUT",
                body,
            }),
            invalidatesTags: ["StockTakes"],
        }),
        deleteStockTake: builder.mutation({
            query: (id) => ({
                url: `/stock-takes?id=${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StockTakes"],
        }),
    }),
})

export const {
    useGetStockTakesQuery,
    useGetStockTakeQuery,
    useCreateStockTakeMutation,
    useUpdateStockTakeMutation,
    useDeleteStockTakeMutation,
} = stockTakesApi
